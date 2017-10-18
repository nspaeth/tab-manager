# `Tab Manager` #

## About ##

Some people think they are tab hoarders with 20 tabs open.

They don't know that another group exists: those who have 197 tabs open across 28 windows, and 1791 tabs saved in OneTab, in just this browser, on just this computer.

This is an extension to help manage tabs for extreme tab hoarders.

Conversations between these groups often goes something like this:

**But, why?**

I open a lot of tabs; probably 90% of all links I open are in new tabs (todo: report this?). I keep tabs open until I am done with them; either I solved whatever problem they were opened for, or I've sufficiently digested their content. As someone who has many interests and simultaneous projects, this leads to a large number of tabs.

** You're insane, have you heard of bookmarks? **

Bookmarks are where tabs to go to never be seen again. They require discipline to keep organized. Bookmarks grow forever without manual intervention via a clumsy interface.

To me, Bookmarks are good for saving pages that you will return to _frequently_.

On the other hand...

_Tabs are survival of the fittest_

While bookmarks live forever unless you actively slog through and cull them, tabs live only while their value outweighs their mental and resource overhead costs.

Tabs serve as a todo list. While a tab is still open it serves as a constant reminder of things I want to work on or learn about.

** How do you keep track of them all!? I'd have a panic attack! **

A combination of good memory, useful shortcuts, and some helpful extensions.
* The Great Suspender helps keep resource usage down. This feature is getting built into browsers via the 'discarded' flag. Also, Firefox is getting very good at resource usage.
* Even with tab suspension, memory usage gets high so OneTab lets me save a bunch of tabs at once, sort of like bookmarks but implicitly unorganized.

Despite these adaptations, my tabs are getting out of hand. Hence, this extension...

### Features ###
* Windows and tabs are densely packed so that it is easy to get a birds eye view of all of them, which makes it easier to organize and trim.

** How is this better, don't you still have to organize them? **

For now, but a feature currently in development will allow them to automatically be re-arranged by topic by looking at the contents of the tabs. This will likely be the most distinguishing and important feature.


## Installation ##
This extension is not yet available on the chrome store. In the mean time, you can clone this repository and navigate to `chrome://extensions`, click `Load unpacked extension...` and then navigate to wherever you cloned this repository.

## Usage ##
Currently, the default key-binding for opening the extension is `Ctrl-Shift-Period`.

- Double-clicking on a tab will bring that tab into focus.
  - **TODO**: make optional behavours to 1) close the TabManager viewer when changing focus or 2) Automatically re-focus the TabManager window.

## TODO ##

* Integration tests
  * Especially saving/loading tabs
* Consider making different tab/window types based on 'saved' status so that typechecking catches errors instead of testing
* Add type info to Messages so that they can be properly type checked instead of being `any`.
* Test in Firefox
* Create a cyclejs font icon component library like `react-fa` to make icons in apps easier.
* Create pull request for Typescript typing of `parseInt`: should accept `string | number`, not just `string`?
* Features
  * Expand the selected item to show more information
  * Make a 'recently closed' list.
  * Make an action log for undo and debugging
  * Sync between multiple browsers/computers
  * Drag & Drop sorting (`cyclejs-sortable`)
    * Refactor cyclejs-sortable to provide `dragSource` and `dropTarget` APIs so that tabs can be dragged between windows
    * Make `makeSortable` a convenience wrapper for that API.
  * Order by recently opened/recently focused
		* Support nesting windows and tabs into pseudo-windows to allow grouping by topics and sub-topics.
		* Make windows/groups have editable labels
  * Improve overall styling
    * Colors
    * Display various tab statuses (Discarded, muted, audible, pinned, loading, active, highlighted, selected, incognito)
    * Optionally display/hide incognito tabs
    * Make the search function optionally blur/desaturate unmatching tabs instead of hiding them
    * Distinguish saved windows from open windows. Styling? Grouping?
    * Start using buttons instead of clickable spans
    * Flash tabs when they update
    * Allow for automatic tab management
    * Option to Automatically re-group tabs by topic
    * 'discard' unused tabs to unload them from memory after some optional time
    * Automatically 'save' 'discarded' tabs after some optional time
* Stop using localStorage because it has limited storage space, even with the `unlimitedStorage` permission

## Waiting for... ##

* TypeScript master has improved `Array.find` typings in `lib.es2015.core.d.ts`
