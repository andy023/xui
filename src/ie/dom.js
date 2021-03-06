/**
	DOM
	===

	Set of methods for manipulating the Document Object Model (DOM).

*/
xui.extend({
/**
	html
	----

	Manipulates HTML in the DOM. Also just returns the inner HTML of elements in the collection if called with no arguments.

	### syntax ###

		x$( window ).html( location, html );

	or this method will accept just a HTML fragment with a default behavior of inner:

		x$( window ).html( html );

	or you can use shorthand syntax by using the location name argument as the function name:

		x$( window ).outer( html );
		x$( window ).before( html );
	
	or you can just retrieve the inner HTML of elements in the collection with:
	
	    x$( document.body ).html();

	### arguments ###

	- location `String` can be one of: _inner_, _outer_, _top_, _bottom_, _remove_, _before_ or _after_.
	- html `String` is a string of HTML markup or a `HTMLElement`.

	### example ###

		x$('#foo').html('inner', '<strong>rock and roll</strong>');
		x$('#foo').html('outer', '<p>lock and load</p>');
		x$('#foo').html('top',   '<div>bangers and mash</div>');
		x$('#foo').html('bottom','<em>mean and clean</em>');
		x$('#foo').html('remove');
		x$('#foo').html('before', '<p>some warmup html</p>');
		x$('#foo').html('after',  '<p>more html!</p>');

	or

		x$('#foo').html('<p>sweet as honey</p>');
		x$('#foo').outer('<p>free as a bird</p>');
		x$('#foo').top('<b>top of the pops</b>');
		x$('#foo').bottom('<span>bottom of the barrel</span>');
		x$('#foo').before('<pre>first in line</pre>');
		x$('#foo').after('<marquee>better late than never</marquee>');
*/
    html: function(location, html) {
        clean(this);

        if (arguments.length == 0) {
            var i = [];
            this.each(function(el) {
                i.push(el.innerHTML);
            });
            return i;
        }
        if (arguments.length == 1 && arguments[0] != 'remove') {
            html = location;
            location = 'inner';
        }
        if (location != 'remove' && html && html.each !== undefined) {
            if (location == 'inner') {
                var d = document.createElement('p');
                html.each(function(el) {
                    d.appendChild(el);
                });
                this.each(function(el) {
                    el.innerHTML = d.innerHTML;
                });
            } else {
                var that = this;
                html.each(function(el){
                    that.html(location, el);
                });
            }
            return this;
        }

        var j, l, returnValue = [], typeOfHtml = typeof html;
        for( j=0, l=this.length; j<l; j++) {
            var el = this[j],
                parent = el.parentNode,
                list,
                len,
                i = 0;
            if (location == "inner") { // .html
                if (typeOfHtml == string || typeOfHtml == "number") {
                    el.innerHTML = html;
                    executeScripts( el );
                } else {
                    el.innerHTML = '';
                    el.appendChild(html);
                }
            } else {
              if (location == 'remove' && parent.removeChild(el) ) {
                var r;
                for(r=j;r<l;r++) // update XUI Collection
                    this[r] = this[r+1];
                delete this[l-1];
                l--;
                j--;
              } else {
                 var elArray = ['outer', 'top', 'bottom'],
                    wrappedE = wrapHelper(html, (arrIndexOf(elArray, location) > -1 ? el : parent )),
                    children = wrappedE.childNodes,
                    targetSet = !1,
                    target = null;

                switch( location ) {
                    case 'outer':
                        parent.replaceChild(wrappedE, el); // .replaceWith
                        break;
                    case 'top':
                        target = el.firstChild;
                    case 'bottom':
                        el.insertBefore(wrappedE, target);
                        break;
                    case 'after':
                         target = el.nextSibling;
                         targetSet = !0;
                    case 'before':
                        if( !targetSet )
                            target = el;
                        parent.insertBefore(wrappedE, target);
                        break;
                }

                var wParent = wrappedE.parentNode,
                    ins,
                    inserted = [];

                while(children.length) {
                    ins = wParent.insertBefore(children[0], wrappedE);
                    if( ins ) {
                        if (typeOfHtml == string || typeOfHtml == "number")
                            executeScripts( ins );

                        inserted.push( ins );
                        if( location == 'after' || location == 'before' )
                            returnValue.push(ins);
                    }
                }
                wParent.removeChild(wrappedE);

                // update XUI Collection
                var insertedLength = inserted.length;

                if( location == 'outer' && insertedLength ) {

                    if( insertedLength > 1 )
                        for( var end = l-1; end >=j; end-- )
                            this[end+insertedLength-1] = this[end];

                    for( var o = 0; o<insertedLength; o++ )
                        this[j+o] = inserted[o];

                    // update keys
                    j += insertedLength-1;
                    l += insertedLength-1;
                }
              }
            }
        }

        // don't forget to update the new length
        this.length = l;

        var rl = returnValue.length;

        return rl === 0 ? this : rl === 1 ? returnValue[0]: returnValue;
    },

/**
	attr
	----

	Gets or sets attributes on elements. If getting, returns an array of attributes matching the xui element collection's indices.

	### syntax ###

		x$( window ).attr( attribute, value );

	### arguments ###

	- attribute `String` is the name of HTML attribute to get or set.
	- value `Varies` is the value to set the attribute to. Do not use to get the value of attribute _(optional)_.

	### example ###

	To get an attribute value, simply don't provide the optional second parameter:

		x$('.someClass').attr('class');

	To set an attribute, use both parameters:

		x$('.someClass').attr('disabled', 'disabled');
*/
    attr: function(attribute, val) {
        if (arguments.length == 2) {
            return this.each(function(el) {
                if (el.tagName && el.tagName.toLowerCase() == 'input' && attribute == 'value') el.value = val;
                else if (el.setAttribute) {
                  if (attribute == 'checked' && (val == '' || val == false || typeof val == "undefined")) el.removeAttribute(attribute);
                  else el.setAttribute(attribute, val);
                }
            });
        } else {
            var attrs = [];
            this.each(function(el) {
                if (el.tagName && el.tagName.toLowerCase() == 'input' && attribute == 'value') attrs.push(el.value);
                else if (el.getAttribute && el.getAttribute(attribute)) {
                    attrs.push(el.getAttribute(attribute));
                }
            });
            return attrs;
        }
    }
});
arrForEach("inner outer top bottom remove before after".split(' '), function (method) {
  xui.fn[method] = function(where) { return function (html) { return this.html(where, html); }; }(method);
});
// private method for finding a dom element
function getTag(el) {
    return (el.firstChild === null) ? {'UL':'LI','DL':'DT','TR':'TD'}[el.tagName] || el.tagName : el.firstChild.tagName;
}

function wrapHelper(html, el) {
  if (typeof html == string) return wrap(html, getTag(el));
  else { var e = document.createElement('div'); e.appendChild(html); return e; }
}

// private method
// Wraps the HTML in a TAG, Tag is optional
// If the html starts with a Tag, it will wrap the context in that tag.
function wrap(xhtml, tag) {
  var e = document.createElement('div');
  e.innerHTML = xhtml;
  return e;
}

/*
* Removes all erronious nodes from the DOM.
* 
*/
function clean(collection) {
    var ns = /\S/;
    collection.each(function(el) {
        var d = el,
            n = d.firstChild,
            ni = -1,
            nx;
        while (n) {
            nx = n.nextSibling;
            if (n.nodeType == 3 && !ns.test(n.nodeValue)) {
                d.removeChild(n);
            } else {
                n.nodeIndex = ++ni; // FIXME not sure what this is for, and causes IE to bomb (the setter) - @rem
            }
            n = nx;
        }
    });
}

function executeScripts(dom) {
    var list = x$('SCRIPT', dom),
        script,
        newScript,
        l = list.length,
        i=0;

    for (; i < l; i++) {
        script = list[i];

        if( script.src ) {
            newScript = document.createElement('script');
            newScript.src = script.src;
            script.parentNode.replaceChild( script, newScript);
        } else
            eval(script.text);
    }
}
