/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-locationviewdetailstabview-tests', function (Y) {
    var attributesTest,
        renderTest,
        changeEventTest,
        fireLoadUserEventTest,
        orderingTest,
        fireLoadSectionEventTest,
        Assert = Y.Assert,
        Mock = Y.Mock;

    attributesTest = new Y.Test.Case({
        name: "eZ LocationViewDetailsTabView attributes test",
        setUp: function () {
            this.locationMock = new Mock();
            Mock.expect(this.locationMock, {
                method: 'get',
                args: [Y.Mock.Value.String],
            });
            this.view = new Y.eZ.LocationViewDetailsTabView({
                content: {},
                location: this.locationMock,
                contentType: {},
                config: {},
                selectedSortField: '',
                selectedSortOrder: '',
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        _readOnlyString: function (attr) {
            var value = this.view.get(attr);

            Assert.isString(
                this.view.get(attr),
                "The view should have a "+  attr
            );
            this.view.set(attr, value + 'somethingelse');
            Assert.areEqual(
                value, this.view.get(attr),
                "The " + attr + " should be readonly"
            );
        },

        "Should have a title": function () {
            this._readOnlyString('title');
        },

        "Should have a identifier": function () {
            this._readOnlyString('identifier');
        },
    });

    renderTest = new Y.Test.Case({
        name: "eZ LocationViewDetailsTabView render test",
        setUp: function () {
            var that = this;

            this.translationsList = ['eng-GB', 'fre-FR'];
            this.contentMock = new Mock();
            this.locationMock = new Mock();
            this.versionMock = new Mock();
            this.ownerMock = new Mock();
            this.creatorMock = new Mock();
            this.sectionMock = new Mock();
            this.sortFieldIdentifier = 'SECTION';
            this.sortFieldName = "sort.section domain=locationview";
            this.loadingError = false;

            Mock.expect(this.contentMock, {
                method: 'get',
                args: ['currentVersion'],
                returns: this.versionMock
            });

            Mock.expect(this.contentMock, {
                method: 'toJSON',
                returns: {}
            });

            Mock.expect(this.versionMock, {
                method: 'getTranslationsList',
                returns: this.translationsList
            });

            Mock.expect(this.versionMock, {
                method: 'toJSON',
                returns: {}
            });

            Mock.expect(this.locationMock, {
                method: 'toJSON',
                returns: {}
            });

            Mock.expect(this.locationMock, {
                method: 'get',
                args: [Y.Mock.Value.String],
                run: function (attr) {
                    if (attr === 'sortField') {
                        return that.sortFieldIdentifier;
                    } else if (attr === 'sortOrder') {
                        return 'ASC';
                    } else {
                        Y.fail("Unexpected parameter " + attr + " for content mock");
                    }
                }
            });

            Mock.expect(this.ownerMock, {
                method: 'toJSON',
                returns: {}
            });

            Mock.expect(this.creatorMock, {
                method: 'toJSON',
                returns: {}
            });

            Mock.expect(this.sectionMock, {
                method: 'toJSON',
                returns: {}
            });

            this.view = new Y.eZ.LocationViewDetailsTabView({
                content: this.contentMock,
                location: this.locationMock,
                config: {},
                creator: this.creatorMock,
                owner: this.ownerMock,
                section: this.sectionMock,
                loadingError: this.loadingError,
                selectedSortField: {},
                selectedSortOrder: {},
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Render should call the template": function () {
            var templateCalled = false,
                origTpl;

            origTpl = this.view.template;
            this.view.template = function () {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };
            this.view.render();
            Y.Assert.isTrue(templateCalled, "The template should have been used to render this.view");
        },

        "Variables should be available in the template": function () {
            var that = this;

            this.view.template = function (args) {
                Assert.areSame(
                    that.contentMock.toJSON(), args.content,
                    "Content should be available in the template"
                );
                Assert.areSame(
                    that.locationMock.toJSON(), args.location,
                    "Location should be available in the template"
                );
                Assert.areSame(
                    that.versionMock.toJSON(), args.currentVersion,
                    "Current version should be available in the template"
                );
                Assert.areSame(
                    that.creatorMock.toJSON(), args.lastContributor,
                    "LastContributor should be available in the template"
                );
                Assert.areSame(
                    that.ownerMock.toJSON(), args.contentCreator,
                    "ContentCreator should be available in the template"
                );
                Assert.areSame(
                    that.sectionMock.toJSON(), args.section,
                    "Section should be available in the template"
                );
                Assert.areSame(
                    that.translationsList, args.translationsList,
                    "TranslationsList should be available in the template"
                );
                Assert.areSame(
                    that.translationsList.length, args.languageCount,
                    "LanguageCount should be available in the template"
                );
                Assert.areSame(
                    that.loadingError, args.loadingError,
                    "loadingError should be available in the template"
                );
                Assert.isTrue(
                    args.isAscendingOrder,
                    "isAscendingOrder should be available in the template"
                );
                Assert.isArray(
                    args.sortFields,
                    "sortFields should be available in the template"
                );
                Y.Array.each(args.sortFields, function(struct) {
                   if (struct.selected === true) {
                       Assert.areSame(
                           struct.identifier, that.sortFieldIdentifier,
                           "sortFieldIdentifier should have been selected and added to the template"
                       );
                       Assert.areSame(
                           struct.name, that.sortFieldName,
                           "sortFieldName should have been added"
                       );
                   }
                });
            };

            this.view.render();
        },
    });

    changeEventTest = new Y.Test.Case({
        name: "eZ LocationViewDetailsTabView change event test",
        setUp: function () {
            this.locationMock = new Mock();
            Mock.expect(this.locationMock, {
                method: 'get',
                args: [Y.Mock.Value.String],
            });
            this.view = new Y.eZ.LocationViewDetailsTabView({location: this.locationMock});
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        _authorsEventTest: function (eventName) {
            var renderCalled = false;

            this.view.render = function () {
                renderCalled = true;
            };

            this.view.fire(eventName);

            Assert.isTrue(
                renderCalled,
                "Render should have been called by the event: " + eventName
            );
        },

        "Test that creator change event calls render": function () {
            this._authorsEventTest('creatorChange');
        },

        "Test that owner change event calls render": function () {
            this._authorsEventTest('ownerChange');
        },
    });

    orderingTest = new Y.Test.Case({
        name: "eZ LocationViewDetailsTabView change event test",
        setUp: function () {
            var that = this;

            this.sortField = 'PRIORITY';
            this.sortOrder = 'ASC';
            this.contentMock = new Mock();
            this.versionMock = new Mock();
            this.locationMock = new Mock();
            this.translationsList = ['eng-GB', 'fre-FR'];
            this.creator = "13";
            this.owner = "42";

            Mock.expect(this.locationMock, {
                method: 'get',
                args: [Y.Mock.Value.String],
                run: function (attr) {
                    if (attr === 'sortField') {
                        return that.sortField;
                    } else if (attr === 'sortOrder') {
                        return that.sortOrder;
                    } else {
                        Y.fail("Unexpected parameter " + attr + " for content mock");
                    }
                }
            });

            Mock.expect(that.contentMock, {
                method: 'get',
                args: [Mock.Value.String],
                run: function (attr) {
                    if (attr === 'currentVersion') {
                        return that.versionMock;
                    } else if (attr === 'resources') {
                        return {Owner: that.owner};
                    } else {
                        Y.fail("Unexpected parameter " + attr + " for content mock");
                    }
                }
            });

            Mock.expect(this.contentMock, {
                method: 'toJSON',
                returns: {}
            });

            Mock.expect(that.versionMock, {
                method: 'get',
                args: ['resources'],
                returns: {Creator: this.creator}
            });

            Mock.expect(this.versionMock, {
                method: 'getTranslationsList',
                returns: this.translationsList
            });

            Mock.expect(this.versionMock, {
                method: 'toJSON',
                returns: {}
            });

            Mock.expect(this.locationMock, {
                method: 'toJSON',
                returns: {}
            });

            this.view = new Y.eZ.LocationViewDetailsTabView({
                content: this.contentMock,
                location: this.locationMock,
                selectedSortField: '',
                selectedSortOrder: '',
                container: '.container'
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should set the sortField and sortOrder attributes": function () {
            var container = this.view.get('container'),
                sortFieldSelector,
                selectedSortFieldIndex,
                sortOrderSelector,
                selectedSortOrderIndex;

            this.view.render();

            sortFieldSelector = container.one('.ez-subitems-ordering-sort-type');
            selectedSortFieldIndex = sortFieldSelector.get('selectedIndex');
            sortOrderSelector = container.one('.ez-subitems-sorting-order');
            selectedSortOrderIndex = sortOrderSelector.get('selectedIndex');

            Assert.areSame(
                sortFieldSelector.get('options').item(selectedSortFieldIndex).get('value'),
                this.view.get('sortField'),
                "sortField should be set"
            );

            Assert.areSame(
                sortOrderSelector.get('options').item(selectedSortOrderIndex).get('value'),
                this.view.get('sortOrder'),
                "sortOrder should be set"
            );
        },

        "Should change selectedSortField and selectedSortOrder when changing the select tag": function () {
            var container = this.view.get('container'),
                sortFieldSelector,
                sortOrderSelector,
                newSortField = 'SECTION',
                newSortOrder = 'DESC';

            this.view.render();

            sortFieldSelector = container.one('.ez-subitems-ordering-sort-type');
            sortOrderSelector = container.one('.ez-subitems-sorting-order');

            Assert.areNotSame(
                newSortField,
                this.view.get('sortField'),
                "selectedSortField should not be changed yet"
            );

            Assert.areNotSame(
                newSortOrder,
                this.view.get('sortOrder'),
                "selectedSortOrder should not be changed yet"
            );

            sortFieldSelector.set('value', newSortField);
            sortOrderSelector.set('value', newSortOrder);
            sortFieldSelector.simulate("change");
            sortOrderSelector.simulate("change");

            Assert.areSame(
                newSortField,
                this.view.get('sortField'),
                "selectedSortField should be changed when changing the select tag"
            );

            Assert.areSame(
                newSortOrder,
                this.view.get('sortOrder'),
                "selectedSortOrder should be changed when changing the select tag"
            );
        },
    });

    function _eventTestSetup(context) {
        context.contentMock = new Mock();
        context.versionMock = new Mock();
        context.locationMock = new Mock();
        context.translationsList = ['eng-GB', 'fre-FR'];
        context.creator = "13";
        context.owner = "42";

        Mock.expect(context.contentMock, {
            method: 'get',
            args: [Mock.Value.String],
            run: function (attr) {
                if (attr === 'currentVersion') {
                    return context.versionMock;
                } else if (attr === 'resources') {
                    return {Owner: context.owner};
                } else {
                    Y.fail("Unexpected parameter " + attr + " for content mock");
                }
            }
        });

        Mock.expect(context.contentMock, {
            method: 'toJSON',
            returns: {}
        });

        Mock.expect(context.versionMock, {
            method: 'get',
            args: ['resources'],
            returns: {Creator: context.creator}
        });

        Mock.expect(context.versionMock, {
            method: 'getTranslationsList',
            returns: context.translationsList
        });

        Mock.expect(context.versionMock, {
            method: 'toJSON',
            returns: {}
        });

        Mock.expect(context.locationMock, {
            method: 'toJSON',
            returns: {}
        });

        Mock.expect(context.locationMock, {
            method: 'get',
            args: [Y.Mock.Value.String],
        });

        context.view = new Y.eZ.LocationViewDetailsTabView({
            content: context.contentMock,
            location: context.locationMock,
            container: '.container'
        });
    }

    fireLoadUserEventTest = new Y.Test.Case({
        name: "eZ LocationViewDetailsTabView fire load user event test",
        setUp: function () {
            _eventTestSetup(this);
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should fire the loadUser event twice with a different owner and creator": function () {
            var that = this,
                ownerCalled = false,
                creatorCalled = false;

            this.view.once('loadUser', function (e) {
                ownerCalled = true;
                Assert.areSame(
                    that.creator,
                    e.userId,
                    "The event facade should contain the creator id"
                );

                that.view.once('loadUser', function (e) {
                    creatorCalled = true;
                    Assert.areSame(
                        that.owner,
                        e.userId,
                        "The event facade should contain the owner id"
                    );
                });
            });

            this.view.set('active', true);

            Assert.isTrue(ownerCalled, "loadUser should have been called for the owner");
            Assert.isTrue(creatorCalled, "loadUser should have been called for the creator");

        },

        "Should fire the loadUser event once if the owner and the creator are the same": function () {
            var that = this,
                ownerCalled = false;

            this.owner = "13";

            this.view.once('loadUser', function (e) {
                ownerCalled = true;
                Assert.areSame(
                    that.creator,
                    e.userId,
                    "The event facade should contain the creator id"
                );

                that.view.once('loadUser', function (e) {
                    Assert.fail("loadUser should not be called for the creator");
                });
            });

            this.view.set('active', true);

            Assert.isTrue(ownerCalled, "loadUser should have been called for the owner");
        },

        "Should copy the creator into owner when they are the same": function () {
            this["Should fire the loadUser event once if the owner and the creator are the same"]();

            this.creatorMock = new Mock();
            Mock.expect(this.creatorMock, {
                method: 'toJSON',
                returns: {}
            });

            this.view.set('creator', this.creatorMock);
            Assert.areSame(
                this.creatorMock,
                this.view.get('owner'),
                "Owner should be the same as creator"
            );
        },

        "Should try to reload the content when tapping on the retry button": function () {
            var that = this,
                loadUser = false;

            this.view.render();
            this.view.set('active', true);
            this.view.set('loadingError', true);

            this.view.on('loadUser', function () {
                loadUser = true;
            });

            this.view.get('container').one('.ez-asynchronousview-retry').simulateGesture('tap', function () {
                that.resume(function () {
                    Y.Assert.isUndefined(
                        that.view.get('creator'),
                        "The `creator` attribute should not be defined"
                    );

                    Y.Assert.isUndefined(
                        that.view.get('owner'),
                        "The `owner` attribute should not be defined"
                    );

                    Y.Assert.isFalse(
                        that.view.get('loadingError'),
                        "The `loadingError` attribute should be resetted to false"
                    );
                    Y.Assert.isTrue(
                        loadUser,
                        "The loadUser should have been fired"
                    );
                });
            });
            this.wait();
        },
    });

    fireLoadSectionEventTest = new Y.Test.Case({
        name: "eZ LocationViewDetailsTabView fire load section event test",
        setUp: function () {
            _eventTestSetup(this);
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should fire the loadSection event when view become active": function () {
            var sectionCalled = false;

            this.view.on('loadSection', Y.bind(function (e) {
                sectionCalled = true;
                Assert.areSame(
                    this.view.get('content'),
                    e.content,
                    "The event facade should contain the content"
                );
            }, this));

            this.view.set('active', true);

            Assert.isTrue(sectionCalled, "loadSection should have been called");
        },

        "Should try to reload the content when tapping on the retry button": function () {
            var loadSection = false;

            this.view.render();
            this.view.set('active', true);
            this.view.set('loadingError', true);

            this.view.on('loadSection', function () {
                loadSection = true;
            });

            this.view.get('container').one('.ez-asynchronousview-retry').simulateGesture('tap', this.next(function () {
                Y.Assert.isUndefined(
                    this.view.get('section'),
                    "The `creator` attribute should not be defined"
                );
                Y.Assert.isFalse(
                    this.view.get('loadingError'),
                    "The `loadingError` attribute should be resetted to false"
                );
                Y.Assert.isTrue(
                    loadSection,
                    "The loadUser should have been fired"
                );
            }, this));
            this.wait();
        },
    });

    Y.Test.Runner.setName("eZ Location View Details Tab View tests");
    Y.Test.Runner.add(attributesTest);
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(changeEventTest);
    Y.Test.Runner.add(orderingTest);
    Y.Test.Runner.add(fireLoadUserEventTest);
    Y.Test.Runner.add(fireLoadSectionEventTest);
}, '', {requires: ['test', 'ez-locationviewdetailstabview', 'node-event-simulate']});
