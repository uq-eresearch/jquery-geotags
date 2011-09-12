/**
 * Copyright (c) 2011 The University of Queensland
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
(function($) {
  $.widget("geotags.geotags", {

    options : {},

    _create : function() {
      this.containers = {};
      _.each([ 'checked', 'unchecked' ], function(containerName) {
        var container = $('<div />');
        container.addClass(this.widgetBaseClass + '-' + containerName);
        this.containers[containerName] = container;
        this.element.append(container);
      }, this);

    },

    _getIconSettings : function(checked) {
      return checked ? {
        primary : 'ui-icon-locked'
      } : {
        primary : 'ui-icon-unlocked'
      };
    },

    addTag : function(label, href, checked) {
      var containerName = checked ? 'checked' : 'unchecked';

      // Create wrapper
      var wrapper = $('<div />');
      _(2).times(function() {
        wrapper.append('<button />');
      });
      this.containers[containerName].append(wrapper);

      // Setup buttons
      $('button', wrapper).first().text('Toggle').button({
        text : false
      }).bind('click.toggle', _.bind(function() {
        this._toggleTag(wrapper);
      }, this)).next().button({
        label : label
      }).bind('click.open', _.bind(function() {
        window.open(href, '_blank');
      }, this)).parent().buttonset();
      this._toggleTag(wrapper, checked);

      // Include info
      wrapper.addClass(this.widgetBaseClass + '-tag');
      _.each({
        label : label,
        href : href
      }, function(v, k) {
        $('<input type="hidden"/>').attr('name', k).attr('value', v).appendTo(
            wrapper);
      }, this);

      console.debug(this.element);
    },

    _toggleTag : function(tag, checked) {
      if (checked === undefined) {
        // Opposite of current state
        checked = !this.containers['checked'].is(tag.parent());
      }
      tag.find('button').first().button('option', 'icons',
          this._getIconSettings(checked));
      if (checked) {
        tag.detach().appendTo(this.containers['checked']);
        tag.find('button').addClass('ui-priority-primary');
      } else {
        tag.detach().appendTo(this.containers['unchecked']);
        tag.find('button').removeClass('ui-priority-primary');
      }
    }

  });
})(jQuery);