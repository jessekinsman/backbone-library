(function ($) {
	var books = [{title:"JS the good parts", author:"John Doe", releaseDate:"2012", keywords:"JavaScript Programming"},
	        {title:"CS the better parts", author:"John Doe", releaseDate:"2012", keywords:"CoffeeScript Programming"},
	        {title:"Scala for the impatient", author:"John Doe", releaseDate:"2012", keywords:"Scala Programming"},
	        {title:"American Psyco", author:"Bret Easton Ellis", releaseDate:"2012", keywords:"Novel Splatter"},
	        {title:"Eloquent JavaScript", author:"John Doe", releaseDate:"2012", keywords:"JavaScript Programming"}];
			
	var Book = Backbone.Model.extend({
		defaults: {
			coverImage:"img/placeholder.png",
			title:"Unknown",
			author:"UnKnown",
			releaseDate:"Unknown",
			keywords:" "
		}
	});
	
	var BookView = Backbone.View.extend({
		tagName: "div",
		className: "bookContainer",
		template: $("#bookTemplate").html(),
		render: function() {
			var tmpl = _.template(this.template);
			this.$el.html(tmpl(this.model.toJSON()));
			return this;
		},
		deleteBook: function() {
			this.model.destroy();
			this.remove();
		},
		editBook: function() {
			var that = this;
			//var editView = new EditBookView({ model:that.model });
			//editView.render();
			that.model.trigger("edit", that.model);
			this.remove();
		},
		
		events: {
			"click .delete": "deleteBook",
			"click .edit": "editBook"
		}
	});
	
	var EditBookView = Backbone.View.extend({
			el: $("#form"),
			template: $("#editTemplate").html(),
			initialize: function(){
				console.log("edit view initialized");
			},
			render: function() {	
					var tmpl = _.template(this.template);
					this.$el.html(tmpl(this.model.toJSON()));
			},
			events: {
				"click .delete": "deleteBook",
				"click #save": "saveEdit"
			},
			deleteBook: function() {
				this.model.destroy();
				this.remove();
			},
			saveEdit: function(e) {
				e.preventDefault();
				frmData = {};
				$("#addBook div").children("input").each(function (i, val) {
					if($(val.id) !== "") {
						frmData[val.id] = $(val).val();
					}
				});
				this.model.set(frmData);
			}
		});
		var AddBookView = Backbone.View.extend({
				el: $("#form"),
				template: $("#addBook").html(),
				initialize: function(){
					console.log("add view initialized");
				},
				render: function() {	
						var tmpl = _.template(this.template);
						this.$el.html(tmpl());
						return this;
				},
				events: {
					"click #add": "addBook"
				},
				addBook: function() {
					this.model.trigger("add", this.model);
				}
			});
	
	var Library = Backbone.Collection.extend({
		model: Book
	});
	
	var LibraryView = Backbone.View.extend({
		el: $("#books"),
		
		initialize: function(){
			this.collection = new Library(books);
			this.render();
			
			this.collection.on("add", this.renderBook, this);
			this.collection.on("remove", this.removeBook, this);
			this.collection.on("edit", this.editBook, this);
			this.collection.on("change", this.renderBook, this);
		},
		
		events: {
			"click #add": "addBook"
		},
		
		render: function(){
			var that = this;
			this.addBookView = new AddBookView();
			this.addBookView.render();
			this.editBookView = new EditBookView();
			_.each(this.collection.models, function(item){
				that.renderBook(item); }, 
				this );
		},
		
		removeBook: function(removedBook){
			var removedBookData = removedBook.attributes;
			_.each(removedBookData, function(val, key){
				if(removedBookData[key] === removedBook.defaults[key]){
					delete removedBookData[key];
				}
			});
			
			_.each(books, function(book) {
				if(_.isEqual(book, removedBookData)){
					books.splice(_.indexOf(books, book), 1);
				}
			});
			
		},
		
		editBook: function(item) {
			this.editBookView.model = item;
			this.editBookView.render();
			console.log("item" + item.get("title"));
		},
		
        addBook:function (e) {
            e.preventDefault();

            var formData = {};

            $("#addBook div").children("input").each(function (i, el) {
                if ($(el).val() !== "") {
                    formData[el.id] = $(el).val();
                }
				console.log("image path: " + formData["coverImage"]);
            });

            books.push(formData);

            this.collection.add(new Book(formData));
        },
		
        renderBook:function (item) {
            var bookView = new BookView({ model:item });
            this.$el.append(bookView.render().el);
			if(this.editBookView) {
				this.addBookView.render();
				console.log("add render");
			}
        }
		
	});
	
	var libraryView = new LibraryView();
}) (jQuery);