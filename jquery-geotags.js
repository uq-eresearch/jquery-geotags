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
    options : {
      username : 'geotags'
    },

    _create : function() {
      this.containers = {};
      _.each([ 'locked', 'unlocked' ], function(containerName) {
        var container = $('<div />');
        container.addClass(this.widgetBaseClass + '-' + containerName);
        this.containers[containerName] = container;
        this.element.append(container);
      }, this);
      this.knownTags = {};
    },

    _getIconSettings : function(locked) {
      return locked ? {
        primary : 'ui-icon-locked'
      } : {
        primary : 'ui-icon-unlocked'
      };
    },

    addTag : function(label, href, locked) {
      if (this.knownTags[href]) {
        return;
      } else {
        this.knownTags[href] = label;
      }

      // Create wrapper
      var wrapper = $('<div />');
      _(2).times(function() {
        wrapper.append('<button />');
      });

      // Setup buttons
      $('button', wrapper).first().text('Toggle').button({
        text : false
      }).bind('click.toggle', _.bind(function(e) {
        e.preventDefault();
        this._toggleTag(wrapper);
      }, this)).next().button({
        label : label
      }).bind('click.open', _.bind(function(e) {
        e.preventDefault();
        window.open(href, '_blank');
      }, this));

      // Include info
      wrapper.addClass(this.widgetBaseClass + '-tag');
      _.each({
        label : label,
        href : href
      }, function(v, k) {
        $('<input type="hidden"/>').attr('name', k).attr('value', v).appendTo(
            wrapper);
      }, this);

      this._toggleTag(wrapper, locked);
      wrapper.buttonset();
    },

    getLocked : function() {
      var tagSelector = '.' + this.widgetBaseClass + '-tag';
      return _.map(this.containers['locked'].find(tagSelector), function(tag) {
        var obj = {};
        _.each($(tag).find('input'), function(input) {
          obj[$(input).attr('name')] = $(input).val();
        });
        return obj;
      }, this);
    },

    clearUnlocked : function() {
      var tags = this.containers['unlocked'].children();
      _.each(tags, function(tag) {
        this.knownTags[$('input[name="href"]', tag).val()] = undefined;
      });
      this.containers['unlocked'].empty();
    },

    loadTags : function(lat, long, radius) {
      if (radius === undefined) {
        // Default 1km radius
        radius = 1;
      } else if (radius > 300) {
        // Geonames has a max radius of 300km
        radius = 300;
      }
      var excludedTags = {
        '6295630' : 'Earth'
      };
      var tags = [];
      var processResponse = function(data, textStatus, jqXHR) {
        _.each(data['geonames'], function(result) {
          if (!excludedTags[result.geonameId]) {
            tags.push({
              id : result.geonameId,
              label : result.name,
              href : 'http://geonames.org/' + result.geonameId + '/'
            });
          }
        });
      };
      var addTags = _.bind(function() {
        this.clearUnlocked();
        tags = _(tags).sortBy(function(tag) {
          return tag.label;
        });
        _.each(tags, function(tag) {
          this.addTag(tag.label, tag.href, false);
        }, this);
        $(this).trigger('tagsLoaded', [ tags ]);
      }, this);
      $.ajax('http://api.geonames.org/findNearbyJSON', {
        type : 'GET',
        data : {
          'lat' : lat,
          'lng' : long,
          'radius' : radius,
          'maxRows' : 50,
          'style' : 'SHORT',
          'username' : this.options.username
        },
        dataType : 'json',
        success : processResponse
      }).done(_.bind(function() {
        var geonameId = _.first(tags).id;
        $.ajax('http://api.geonames.org/hierarchyJSON', {
          type : 'GET',
          data : {
            'geonameId' : geonameId,
            'style' : 'SHORT',
            'username' : this.options.username
          },
          dataType : 'json',
          success : processResponse
        }).done(addTags);
      }, this));
    },

    _toggleTag : function(tag, locked) {
      if (locked === undefined) {
        // Opposite of current state
        locked = !this.containers['locked'].is(tag.parent());
      }
      tag.find('button').first().button('option', 'icons',
          this._getIconSettings(locked));
      if (locked) {
        this._putTagInContainer(this.containers['locked'], tag);
        tag.find('button').addClass('ui-priority-primary');
      } else {
        this._putTagInContainer(this.containers['unlocked'], tag);
        tag.find('button').removeClass('ui-priority-primary');
      }
    },

    _putTagInContainer : function(container, tag) {
      tag.detach().appendTo(container);
      var orderedTags = $(_.sortBy(container.children(), function(tag) {
        return $('input[name="label"]', tag).val();
      }));
      orderedTags.detach().appendTo(container);
    }

  });
})(jQuery);