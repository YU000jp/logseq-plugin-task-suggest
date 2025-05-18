export function provideStyles(INPUT_ID: string, logseqVerMd: boolean) {
  logseq.provideStyle(
    logseqVerMd === true ?
      // For md model
      `

    #right-sidebar-container div.sidebar-item:has(#${INPUT_ID}) {
      overflow: visible;
      position: static;
      display: unset;
    }

    #${INPUT_ID} {
      position: absolute;
      top: 195%;
      left: 0;
      z-index: var(--ls-z-index-level-2);
      display: none;

      .task-Suggest-container {
        background: var(--ls-primary-background-color);
        min-width: 400px;
        width: 100%;
        max-width: var(--ls-main-content-max-width);
        position: relative;
        box-shadow: 0 0 16px 2px var(--ls-border-color);

        &.ls-wide-mode {
          max-width: var(--ls-main-content-max-width-wide);
        }
      }

      .task-Suggest-input {
        position: relative;
        width: 100%;
        line-height: 1.2rem;
        border: none;
        border-bottom: 1px solid var(--ls-block-bullet-color);
        margin-bottom: 5px;
        background: var(--ls-tertiary-background-color) !important;
        box-shadow: 0 0 4px 0 var(--ls-border-color) !important;

        &:focus {
          box-shadow: none;
          border-color: inherit;
          border-bottom: 1px solid var(--ls-block-bullet-color);
        }

        &::placeholder {
          font-size: 0.8em;
          color: var(--ls-secondary-text-color);
        }
      }

      @keyframes spin {
        0% {
          transform: rotate(0);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      .task-Suggest-progress {
        display: none;
        position: absolute;
        top: 8px;
        right: 8px;
        font-family: 'tabler-icons';
        font-size: 0.8em;
        margin-left: 6px;
        color: var(--ls-icon-color);
        will-change: transform;
        animation: 1s linear infinite spin;
      }

      .task-Suggest-show {
        display: block;
      }

      .task-Suggest-b-label {
        opacity: .8;
        font-size: .9;
      }

      .task-Suggest-inputhint {
        position: absolute;
        top: 0;
        left: 0;
        transform: translateY(-110%);
        padding: 0 0.5em;
        font-size: 0.8em;
        line-height: 2;
        color: var(--ls-primary-background-color);
        background: var(--ls-primary-text-color);
        opacity: 0.8;
        border-radius: 2px;
      }

      .task-Suggest-list {
        list-style-type: none;
        margin-left: 0;
        font-size: 0.875rem;
        border: 1px solid var(--ls-border-color);
        max-height: 400px;
        overflow-y: auto;

        &:empty {
          display: none;
        }

        &.task-Suggest-keynav {
          .task-Suggest-listitem:hover {
            background: var(--ls-quaternary-background-color);
          }
        }
      }

      .task-Suggest-listitem {
        padding: 10px 12px;
        margin: 0;
        cursor: pointer;
        display: flex;
        align-items: baseline;
        user-select: none;
      }

      .task-Suggest-chosen {
        background: var(--ls-selection-background-color);
      }

      .task-Suggest-tagicon {
        flex: 0 0 auto;
        margin-right: 1em;
        font-weight: bold;
        font-size: 0.75em;
        background-color: var(--ls-tertiary-background-color);
        padding: 1px 5px;
        border-radius: 4px;
      }

      .task-Suggest-listitem-text {
        flex: 1 1 auto;
      }

      .task-Suggest-b-segs {
        font-size: 0.9em;
        opacity: 0.8;
      }

      .task-Suggest-b-spacer.mx-2 {
        margin-left: 0.2rem;
        margin-right: 0.2rem;
      }

      .task-Suggest-doc-link {
        float: right;
        display: inline-block;
        word-break: keep-all;
        color: var(--ls-block-highlight-color);
      }

      .task-Suggest-inline {
        .task-Suggest-container {
          width: calc(100% + 40px);
          margin-left: -28px;
          margin-top: 20px;
          box-shadow: none;
        }

        .task-Suggest-list {
          height: calc(100vh - 230px);
          max-height: initial;
        }
      }

      .task-Suggest-keyword-highlight {
        color: var(--ls-page-mark-color);
        background-color: var(--ls-page-mark-bg-color);
      }
    }

      `:// For db model
      `
    #left-container:has(#${INPUT_ID}) {
      display: unset;
      position: static;
    }
    #main-content-container div.ls-page-blocks:has(#${INPUT_ID}) { 
      overflow: visible;
    }

    #right-sidebar-container div.ls-page-blocks:has(#${INPUT_ID}) {
      overflow: visible;
    }

    #${INPUT_ID} {
      display: none;
      position: absolute;
      top: 0;
      left: 0;
      z-index: var(--ls-z-index-level-2);
      overflow: visible;


      .task-Suggest-container {
        background: var(--ls-primary-background-color);
        box-shadow: 0 0 16px 2px var(--ls-border-color);
        min-width: 400px;
        max-width: var(--ls-main-content-max-width);
        position: absolute;
        top: 4em;
        left: 0;
        z-index: var(--ls-z-index-level-2);
        overflow: visible;

        &.ls-wide-mode {
          max-width: var(--ls-main-content-max-width-wide);
        }
      }

      .task-Suggest-input {
        position: relative;
        width: 100%;
        line-height: 1.2rem;
        border: none;
        border-bottom: 1px solid var(--ls-block-bullet-color);
        margin-bottom: 5px;
        background: var(--ls-tertiary-background-color) !important;
        box-shadow: 0 0 4px 0 var(--ls-border-color) !important;

        &:focus {
          box-shadow: none;
          border-color: inherit;
          border-bottom: 1px solid var(--ls-block-bullet-color);
        }

        &::placeholder {
          font-size: 0.8em;
          color: var(--ls-secondary-text-color);
        }
      }

      @keyframes spin {
        0% {
          transform: rotate(0);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      .task-Suggest-progress {
        display: none;
        position: absolute;
        top: 8px;
        right: 8px;
        font-family: 'tabler-icons';
        font-size: 0.8em;
        margin-left: 6px;
        color: var(--ls-icon-color);
        will-change: transform;
        animation: 1s linear infinite spin;
      }

      .task-Suggest-show {
        display: block;
      }

      .task-Suggest-b-label {
        opacity: .8;
        font-size: .9;
      }

      .task-Suggest-inputhint {
        position: absolute;
        top: 0;
        left: 0;
        transform: translateY(-110%);
        padding: 0 0.5em;
        font-size: 0.8em;
        line-height: 2;
        color: var(--ls-primary-background-color);
        background: var(--ls-primary-text-color);
        opacity: 0.8;
        border-radius: 2px;
      }

      .task-Suggest-list {
        list-style-type: none;
        margin-left: 0;
        font-size: 0.875rem;
        border: 1px solid var(--ls-border-color);
        max-height: 400px;
        overflow-y: auto;

        &:empty {
          display: none;
        }

        &.task-Suggest-keynav {
          .task-Suggest-listitem:hover {
            background: var(--ls-quaternary-background-color);
          }
        }
      }

      .task-Suggest-listitem {
        padding: 10px 12px;
        margin: 0;
        cursor: pointer;
        display: flex;
        align-items: baseline;
        user-select: none;
      }

      .task-Suggest-chosen {
        background: var(--ls-selection-background-color);
      }

      .task-Suggest-tagicon {
        flex: 0 0 auto;
        margin-right: 1em;
        font-weight: bold;
        font-size: 0.75em;
        background-color: var(--ls-tertiary-background-color);
        padding: 1px 5px;
        border-radius: 4px;
      }

      .task-Suggest-listitem-text {
        flex: 1 1 auto;
      }

      .task-Suggest-b-segs {
        font-size: 0.9em;
        opacity: 0.8;
      }

      .task-Suggest-b-spacer.mx-2 {
        margin-left: 0.2rem;
        margin-right: 0.2rem;
      }

      .task-Suggest-doc-link {
        float: right;
        display: inline-block;
        word-break: keep-all;
        color: var(--ls-block-highlight-color);
      }

      .task-Suggest-inline {
        .task-Suggest-container {
          width: calc(100% + 40px);
          margin-left: -28px;
          margin-top: 20px;
          box-shadow: none;
        }

        .task-Suggest-list {
          height: calc(100vh - 230px);
          max-height: initial;
        }
      }

      .task-Suggest-keyword-highlight {
        color: var(--ls-page-mark-color);
        background-color: var(--ls-page-mark-bg-color);
      }
    }

  `)
}
