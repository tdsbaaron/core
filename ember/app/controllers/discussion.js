import Ember from 'ember';

import PostStream from '../models/post-stream';

export default Ember.ObjectController.extend(Ember.Evented, {

    needs: ['application', 'composer'],
    
    queryParams: ['start'],
    start: '1',
    searchQuery: '',

    loaded: false,
    stream: null,

    setup: function(discussion) {
        this.set('model', discussion);

        // Set up the post stream object. It needs to know about the discussion
        // its representing the posts for, and we also need to inject the Ember
        // data store.
        var stream = PostStream.create();
        stream.set('discussion', discussion);
        stream.set('store', this.get('store'));
        this.set('stream', stream);

        // Next, we need to load a list of the discussion's post IDs into the
        // post stream object. If we don't already have this information, we'll
        // need to reload the discussion model.
        var promise = discussion.get('posts') ? Ember.RSVP.resolve(discussion) : discussion.reload();

        // When we know we have the post IDs, we can set up the post stream with
        // them. Then the view will trigger the stream to load as it sees fit.
        var controller = this;
        promise.then(function(discussion) {
            stream.setup(discussion.get('postIds'));
            controller.set('loaded', true);
        });
    },

    actions: {
        reply: function() {
            this.set('controllers.composer.showing', true);
            this.set('controllers.composer.title', 'Replying to <em>'+this.get('model.title')+'</em>');
        },

        // This action is called when the start position of the discussion
        // currently being viewed changes (i.e. when the user scrolls up/down
        // the post stream.)
        updateStart: function(start) {
            this.set('start', start);
        }
    }
});
