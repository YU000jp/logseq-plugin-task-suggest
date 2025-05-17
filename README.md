# Logseq Plugin: Task Suggest

<div align="right">
 
[English](https://github.com/YU000jp/logseq-plugin-task-suggest) / [日本語](https://github.com/YU000jp/logseq-plugin-task-suggest/blob/master/README.ja.md) [![latest release version](https://img.shields.io/github/v/release/YU000jp/logseq-plugin-task-suggest)](https://github.com/YU000jp/logseq-plugin-task-suggest/releases) [![License](https://img.shields.io/github/license/YU000jp/logseq-plugin-task-suggest?color=blue)](https://github.com/YU000jp/logseq-plugin-task-suggest/LICENSE) [![Downloads](https://img.shields.io/github/downloads/YU000jp/logseq-plugin-task-suggest/total.svg)](https://github.com/YU000jp/logseq-plugin-task-suggest/releases)
 ~~公開日 20250517~~ <a href="https://www.buymeacoffee.com/yu000japan"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a pizza&emoji=🍕&slug=yu000japan&button_colour=FFDD00&font_colour=000000&font_family=Poppins&outline_colour=000000&coffee_colour=ffffff" /></a>
 </div>
 
## Features

-   A plugin to quickly create tasks by reusing previously written text.
-   Suitable for when performing tasks you've done before.

![image](https://github.com/user-attachments/assets/2c51dc5a-1650-4e5f-af62-8fb7d7ff6ab8)

## Installation

~~Please install from the Logseq Marketplace.~~

## How to Use

1.  Place the cursor in a block (in edit mode) and create a task.
    -   Type `TODO` or execute the `/TODO` shortcut.
    > It can also be called as a shortcut command: `Ctrl(Cmd) + Space`
2.  The suggestion will be invoked.
    -   The cursor will be placed in the input field, so enter keywords related to the previous task.
      > Input history available
    -   If you do not want to use the suggestion at this time, press the `Esc`or `Tab` key to cancel it.
3.  A query is executed based on the keyword, and a list of suggestions is displayed.
4.  Selecting an item copies the text to the block.

## Operation Method

-   Select a suggestion item with the `↑ ↓` keys or by clicking, and copy the text.
    -   Tip: Open a preview of the block in the sidebar with `Shift + Enter` or `Shift + Click`.
-   To close the suggestion, press the `Esc` or `Tab` key.

## Prior Art and Credits

-   Icon: https://www.svgrepo.com/svg/436262/task by Taigaio
-   Plugin: Smart Search plugin (by Sethyuan)
