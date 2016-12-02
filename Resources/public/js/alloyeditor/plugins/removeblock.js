/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global CKEDITOR */
YUI.add('ez-alloyeditor-plugin-removeblock', function (Y) {
    "use strict";

    var removeBlockCommand;

    if (CKEDITOR.plugins.get('ezremoveblock')) {
        return;
    }

    removeBlockCommand = {
        /**
         * Moves the caret to the element
         *
         * @method _moveCaretToElement
         * @protected
         * @param {CKEDITOR.editor} editor
         * @param {CKEDITOR.dom.element} element
         */
        _moveCaretToElement: function (editor, element) {
            var range = editor.createRange();

            range.moveToPosition(element, CKEDITOR.POSITION_AFTER_START);
            editor.getSelection().selectRanges([range]);
        },

        /**
         * Fires the editorInteraction event so that AlloyEditor's UI is updated
         * for the newly focused element
         *
         * @method _fireEditorInteraction
         * @protected
         * @param {CKEDITOR.editor} editor
         * @param {CKEDITOR.dom.element} removedElement
         * @param {CKEDITOR.dom.element} newFocus
         */
        _fireEditorInteraction: function (editor, newFocus) {
            var e = {
                    editor: editor,
                    target: newFocus.$,
                    name: 'eZRemoveBlockDone',
                };

            editor.fire('editorInteraction', {
                nativeEvent: e,
                selectionData: editor.getSelectionData(),
            });

        },

        /**
         * Changes the focused element in the editor to the given newFocus
         * element
         *
         * @param {CKEDITOR.editor} editor
         * @param {CKEDITOR.dom.element} newFocus
         * @protected
         * @method _changeFocus
         */
        _changeFocus: function (editor, newFocus) {
            var widget = editor.widgets.getByElement(newFocus);

            if ( widget ) {
                widget.focus();
            } else {
                this._moveCaretToElement(editor, newFocus);
                this._fireEditorInteraction(editor, newFocus);
            }
       },

        exec: function (editor, data) {
            var toRemove = editor.elementPath().block,
                newFocus;

            if ( !toRemove ) {
                // path.block is null when a widget is focused so the element to
                // remove is the focused widget wrapper.
                toRemove = editor.widgets.focused.wrapper;
            }
            newFocus = toRemove.getNext();
            if ( !newFocus || newFocus.type === CKEDITOR.NODE_TEXT || newFocus.hasAttribute('data-cke-temp') ) {
                // the data-cke-temp element is added by the Widget plugin for
                // internal purposes but it exposes no API to handle it, so we
                // are forced to manually check if newFocus is this element
                // see https://jira.ez.no/browse/EZP-26016
                newFocus = toRemove.getPrevious();
            }

            toRemove.remove();
            if ( newFocus ) {
                this._changeFocus(editor, newFocus);
            }
        },
    };

    /**
     * CKEditor plugin providing the eZRemoveBlock command. This command
     * allows to remove the block element holding the caret or the focused
     * widget
     *
     * @class ezremoveblock
     * @namespace CKEDITOR.plugins
     * @constructor
     */
    CKEDITOR.plugins.add('ezremoveblock', {
        requires: 'widget',

        init: function (editor) {
            editor.addCommand('eZRemoveBlock', removeBlockCommand);
        },
    });
});
