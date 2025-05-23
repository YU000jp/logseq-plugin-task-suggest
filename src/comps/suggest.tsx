import { t } from "logseq-l10n"
import { forwardRef } from "preact/compat"
import {
  StateUpdater,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "preact/hooks"
import { debounce, throttle } from "rambdax"
import { cls, useCompositionChange } from "reactutils"
import EventEmitter from "./event"
import { postProcessResult } from "./query"

import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user"
import { readHistory, writeHistory } from "./recent"
import Breadcrumb from "./Breadcrumb"
import { booleanLogseqVersionMd } from ".."

const BLUR_WAIT = 200
const HISTORY_LEN = 30

const KEY_NAV_MODE = 0
const MOUSE_NAV_MODE = 1

const events = new EventEmitter()

let lockForm: boolean = false

interface SmartSearchInputProps {
  onClose: (output?: string) => void
  root: HTMLElement
}

export default forwardRef(function SmartSearchInput(
  { onClose, root }: SmartSearchInputProps,
  ref,
) {
  const input = useRef<HTMLInputElement>(null)
  const ul = useRef<HTMLUListElement>(null)
  const [list, setList] = useState<BlockEntity[]>([])
  const [chosen, setChosen] = useState(0)
  const [navMode, setNavMode] = useState(KEY_NAV_MODE)
  const [isCompletionRequest, setIsCompletionRequest] = useState(false)
  const [historyList, setHistoryList] = useState([])
  const [showProgress, setShowProgress] = useState(false)
  const closeCalled = useRef(false)
  const lastQ = useRef<string | true | undefined>()
  const lastResult = useRef<BlockEntity[]>([])

  const handleQuery = useCallback(
    debounce(async (e: { target: { value: string } }) => {
      await performQuery(e.target.value)
    }, 400),
    []
  )

  useImperativeHandle(ref, () => ({
    fill(prefilled) {
      if (input.current) input.current.value = prefilled
      performQuery(prefilled)
    },
  }))

  async function performQuery(keyword: string | null) {
    if (!keyword) {
      resetState()
      return
    }

    if (keyword === lastQ.current) {
      if (lastResult.current.length > 0) {
        setList(await postProcessResult(lastResult.current, true, keyword) || [])
      }
      setChosen(0)
      return
    }

    lastQ.current = keyword
    setShowProgress(true)

    try {
      const processedResult = await postProcessResult([], true, keyword)
      setList(processedResult || [])
      setChosen(0)
      setIsCompletionRequest(false)
    } catch (err) {
      console.error(err, keyword)
    } finally {
      setShowProgress(false)
    }
  }

  async function onKeyDown(e) {
    switch (e.key) {
      case "Escape":
      case "Tab": {
        e.stopPropagation()
        e.preventDefault()
        closeCalled.current = true
        onClose()
        if (input.current) {
          input.current.value = ""
        }
        resetState()
        return
      }
      // Shiftキー
      case "Shift": {
        e.stopPropagation()
        e.preventDefault()

        if (lockForm === true) return
        lockForm = true
        setTimeout(() => {
          lockForm = false
        }, 400)

        if (list[chosen]?.uuid) {
          await logseq.Editor.openInRightSidebar(list[chosen].uuid)
          // サイドバーでそのブロックをプレビュー
          logseq.UI.showMsg(t("Previewing..."), "info", { timeout: 2500 })
          break
        }
      }
      // Enterキー
      case "Enter": {
        if (e.isComposing) return

        if (lockForm === true) return
        lockForm = true
        setTimeout(() => {
          lockForm = false
        }, 400)

        if (e.shiftKey) {
          // Shiftキーが押されている場合は何もしない
          break
        }

        if (list.length > 0) {
          e.stopPropagation()
          e.preventDefault()
          if (list[chosen].content) outputAndClose(list[chosen].content)
        } else if (input.current == null || input.current.value.length === 0) {
          setInputQuery(e, historyList[chosen])
        }
        break
      }
      // ↓キー
      case "ArrowDown": {
        e.stopPropagation()
        e.preventDefault()
        const len = list.length || historyList.length
        if (len > 0) {
          setChosen((n) => (n + 1 < len ? n + 1 : 0))
          setNavMode(KEY_NAV_MODE)
        }
        break
      }
      // ↑キー
      case "ArrowUp": {
        e.stopPropagation()
        e.preventDefault()
        const len = list.length || historyList.length
        if (len > 0) {
          setChosen((n) => (n - 1 >= 0 ? n - 1 : len - 1))
          setNavMode(KEY_NAV_MODE)
        }
        break
      }
      default:
        // HACK: do not propagate select all.
        if (
          (!e.ctrlKey && !e.metaKey && !e.altKey) ||
          ((e.metaKey || e.ctrlKey) && e.code === "KeyA") ||
          ((e.metaKey || e.ctrlKey) && e.code === "KeyZ") ||
          ((e.metaKey || e.ctrlKey) && e.shiftKey && e.code === "KeyZ") ||
          (e.ctrlKey && e.code === "KeyY")
        ) {
          e.stopPropagation()
        }
        break
    }
  }

  async function chooseOutput(
    e: React.MouseEvent<HTMLElement>,
    block: BlockEntity,
  ) {
    e.stopPropagation()
    e.preventDefault()

    // Shiftキー＋クリックの場合
    if (e.shiftKey) {
      await logseq.Editor.openInRightSidebar(block.uuid)
      return
    }

    outputAndClose(block.content)
  }

  function outputAndClose(output: string, noHistory = false) {
    if (closeCalled.current) return
    closeCalled.current = true

    if (output) {
      onClose(output)
      logseq.UI.showMsg(`Task selected ${output}`)
    } else {
      onClose() // output がない場合も onClose を呼び出す
    }

    if (input.current?.value && !noHistory) {
      setHistory(input.current?.value)
    }
    resetState() // resetState は最後に呼び出す
  }

  const setHistory = useCallback(
    (currentValue) => {
      if (currentValue === " ") return
      setHistoryList((prevHistoryList) => {
        const index = prevHistoryList.findIndex((v) => v === currentValue)
        let history
        if (index > -1) {
          history = [
            currentValue,
            ...prevHistoryList.slice(0, index),
            ...prevHistoryList.slice(index + 1),
          ]
        } else if (prevHistoryList.length < HISTORY_LEN) {
          history = [currentValue, ...prevHistoryList]
        } else {
          history = [
            currentValue,
            ...prevHistoryList.slice(0, prevHistoryList.length - 1),
          ]
        }
        writeHistory(history)
        events.emit("history.change", { fromId: root })
        return history
      })
    },
    [historyList, root],
  )

  function onFocus(e) {
    closeCalled.current = false
    if (ul.current) {
      const chosenElement = ul.current.querySelector<HTMLElement>(
        ".task-Suggest-chosen",
      )
      chosenElement?.scrollIntoView({ block: "nearest" })
    }
  }

  function resetState() {
    if (input.current && input.current.value.length === 0) {
      setList([])
      setChosen(0)
      lastQ.current = undefined
      lastResult.current = []
    }
    setNavMode(KEY_NAV_MODE)
  }

  function setInputQuery(
    e: React.MouseEvent<HTMLElement>,
    q: string,
    viaClick = false,
  ) {
    e.stopPropagation()
    e.preventDefault()

    if (viaClick) {
      // Prevent input from closing due to onblur.
      setTimeout(() => {
        if (input.current) (input.current as HTMLInputElement).focus()
      }, BLUR_WAIT + 1)
    }

    if (input.current) input.current.value = q
    // HACK: let input be shown first for better UX.
    performQuery(q)
  }

  const changeNavMode = useCallback(
    throttle((e) => {
      if (navMode === KEY_NAV_MODE) {
        setNavMode(MOUSE_NAV_MODE)
      }
    }, 100),
    [navMode],
  )

  useEffect(() => {
    ul.current!.querySelector(".task-Suggest-chosen")?.scrollIntoView({
      block: "nearest",
    })
  }, [chosen])

  useEffect(() => {
    const offHook = logseq.App.onCurrentGraphChanged(async () => {
      const history = (await readHistory()) as StateUpdater<never[]>
      setHistoryList(history)
    })
    async function refreshHistory(data?) {
      if (data?.fromId === root) return
      const history = (await readHistory()) as StateUpdater<never[]>
      setHistoryList(history)
    }
    events.on("history.change", refreshHistory)
    refreshHistory()
    return () => {
      events.off("history.change", refreshHistory)
      offHook()
    }
  }, [])

  const inputProps = useCompositionChange(handleQuery)

  const stopPropagation = useCallback((e) => e.stopPropagation(), [])

  return (
    <div class="task-Suggest-container">
      <div>
        <input
          ref={input}
          class="task-Suggest-input"
          type="text"
          placeholder={
            //ここにキーワードを入れると、過去のタスクを検索できます
            t("Enter keywords here to search for previous tasks")
          }
          title={
            // Escキーでサジェストを解除
            // 空白を入力すると、すべてのタスクが結果に出ます
            t("Press Esc to cancel suggestions.") +
            ((logseq.settings!.includeNonTaskBlocks as boolean) === false
              ? "\n" +
                t("If you enter a blank, all tasks will appear in the results")
              : "")
          }
          {...inputProps}
          onKeyDown={onKeyDown}
          onMouseDown={stopPropagation}
          onFocus={onFocus}
        />
        <div
          class={cls(
            "task-Suggest-progress",
            showProgress && "task-Suggest-show",
          )}
        >
          &#xeb15;
        </div>
      </div>
      <ul
        ref={ul}
        class={cls(
          "task-Suggest-list",
          navMode === KEY_NAV_MODE && "task-Suggest-keynav",
        )}
        onMouseMove={changeNavMode}
        title={
          list.length > 0
            ? // Shiftキーでサイドバーに開きます
              t("Shift key to open in the sidebar")
            : // 履歴です
              t("Recent inputs")
        }
      >
        {list.length > 0 ? (
          list.map((block, i) => (
            <li
              key={(block as BlockEntity).uuid}
              class={cls(
                "task-Suggest-listitem",
                i === chosen && "task-Suggest-chosen",
              )}
              onMouseDown={stopPropagation}
              onClick={(e) => chooseOutput(e, block)} // タスク候補のクリック処理
            >
              <div class="task-Suggest-tagicon">
                T
              </div>
              <div class="task-Suggest-listitem-text">
                {block.breadcrumb &&
                  (logseq.settings!.enableBreadcrumb as boolean) === true && (
                    <Breadcrumb segments={block.breadcrumb} />
                  )}
                {((block.highlightContent ?? block.content) as string)
                  .split("\n")
                  .map((line) => (
                    <p key={line} dangerouslySetInnerHTML={{ __html: line }} />
                  ))}
              </div>
            </li>
          ))
        ) : (input.current == null || input.current?.value.length === 0) &&
          historyList.length > 0 ? (
          historyList.map((query, i) => (
            <li
              key={i}
              class={cls(
                "task-Suggest-listitem",
                i === chosen && "task-Suggest-chosen",
              )}
              onClick={(e) => setInputQuery(e, query, true)} // 履歴候補のクリック処理
            >
              <div class="task-Suggest-listitem-text">{query}</div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault() // preventDefault を追加
                  removeHistory(query)
                }}
                title={t("Delete")}
              >
                <span class="material-icons">🗑️</span>
              </button>
            </li>
          ))
        ) : (
          <li>
            <div class="task-Suggest-listitem-text">
              {historyList.length === 0
                ? // 履歴はありません
                  t("No recent")
                : //検索結果はありません
                  t("No result")}
            </div>
          </li>
        )}
      </ul>
      {/* <div class="task-Suggest-inputhint">
        <div>
          <a
            class="task-Suggest-doc-link"
            href={t("https://github.com/YU000jp/logseq-plugin-task-suggest")}
          >
            {t("→ doc")}
          </a>
        </div>
      </div> */}
    </div>
  )

  async function removeHistory(query: string) {
    const history = historyList.filter((v) => v !== query)
    writeHistory(history)
    setHistoryList(history)
    events.emit("history.change", { fromId: root })
  }
})
