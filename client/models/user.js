define([
    "hr/hr",
    "api",
    "notifications"
], function(hr, api, notifications) {
    var User = hr.Model.extend({
        defaults: {
        	'email': hr.Storage.get("email", ""),
        	'token': hr.Storage.get("token", "")
        },

        /*
         *  Constructor
         */
        initialize: function() {
            User.__super__.initialize.apply(this, arguments);

            // User change
            this.on("change", function() {
            	hr.Storage.set("email", this.get("email", ""));
            	hr.Storage.set("token", this.get("token", ""));

                this.connectNotifications();
            }, this);
            
            this.connectNotifications();
            return this;
        },

        /*
         *  Connect notifications
         */
        connectNotifications: function() {
            if (this.isAuth()) {
                notifications.subscribe(this.get("token"));
            }
            return this;
        },

        /*
         *	Check if the user is authenticate
         */
        isAuth: function() {
        	return (Boolean(this.get("email", ""))
        		&& Boolean(this.get("token", "")));
        },

        /*
         *	Log in the user
         *	:param email user email address
         *	:param password user password
         */
        login: function(email, password) {
        	var that = this;
        	return api.request("post", "auth/login", {
                'email': email,
                'password': password
            }).done(function(data) {
            	that.set(data);
            });
        },

        /*
         *	Sign up the user
         *	:param email user email address
         *	:param password user password
         */
        signup: function(email, password) {
        	var that = this;
        	return api.request("post", "auth/signup", {
                'email': email,
                'password': password
            }).done(function(data) {
            	that.set(data);
            });
        },

        /*
         *	Log out the user
         */
        logout: function() {
        	this.set({
        		'email': null,
        		'token': null
        	})
        	return this;
        },

        /*
         *  Key/Value storage for user settings
         *
         *  TODO: add sync with server
         */

        getSettings: function(key) {
            return hr.Storage.get(this.get("email")+"/"+key);
        },
        setSettings: function(key, value) {
            hr.Storage.set(this.get("email")+"/"+key, value);
            this.trigger("settings.change."+key, key);
            return this;
        },


        /*
         *  Get list reports
         */
        reports: function() {
            return this.getSettings("reports") || [];
        },

        /*
         *  Add a new report
         */
        addReport: function(report) {
            var reports = this.reports();
            reports.push(report);
            reports = _.uniq(reports);
            this.setSettings("reports", reports);
            return this;
        },

        /*
         *  Remove a report
         */
        removeReport: function(report) {
            var reports = this.reports();
            reports.remove(report);
            reports = _.uniq(reports);
            this.setSettings("reports", reports);
            return this;
        }
    }, {
        current: null
    });

    User.current = new User();
    return User;
});