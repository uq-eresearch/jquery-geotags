describe('jquery-w3cdtf', function() {

  it('is a jquery plugin', function() {
    expect(typeof ($.fn.geotags)).toBe('function');
  });

  describe('initialization', function() {
    var wrapper = null;
    var initialElement = null;

    beforeEach(function() {
      if (wrapper != null) {
        wrapper.remove();
      }
      wrapper = $('<div/>');
      $('body').append(wrapper);
      initialElement = $('<div/>');
      wrapper.append(initialElement);
    });

    it('allows tags to be added manually', function() {
      expect($('div', wrapper).length).toBe(1);
      $(initialElement).geotags({});
      expect($('div', wrapper).length).toBeGreaterThan(0);

      expect($('div input', wrapper).length).toBe(0);
      $(initialElement).data('geotags').addTag('Mosnang',
          'http://www.geonames.org/7286562', true);
      expect($('div input', wrapper).length).toBe(2);
      expect($('div input:hidden[name="label"]', wrapper).val())
          .toBe('Mosnang');
      expect($('div input:hidden[name="href"]', wrapper).val()).toBe(
          'http://www.geonames.org/7286562');
      expect($('div button', wrapper).last().text()).toBe('Mosnang');
    });

    it('provides a list of locked tags', function() {
      $(initialElement).geotags({});

      expect($('div input', wrapper).length).toBe(0);
      $(initialElement).data('geotags').addTag('Mosnang',
          'http://www.geonames.org/7286562', true);
      $(initialElement).data('geotags').addTag('Wahlkreis Toggenburg',
          'http://www.geonames.org/7285001', false);
      $(initialElement).data('geotags').addTag('Swiss Confederation',
          'http://www.geonames.org/2658434', true);

      expect($(initialElement).data('geotags').getLocked()).toEqual([ {
        label : 'Mosnang',
        href : 'http://www.geonames.org/7286562'
      }, {
        label : 'Swiss Confederation',
        href : 'http://www.geonames.org/2658434'
      } ]);
    });

    it('can get tags from a lat/long', function() {
      expect($('div input', wrapper).length).toBe(0);
      $(initialElement).geotags({});

      var tagsWereLoaded = false;

      $($(initialElement).data('geotags')).bind('tagsLoaded', function() {
        tagsWereLoaded = true;
      });

      runs(function() {
        $(initialElement).data('geotags').loadTags(47.3, 9);
      });

      waits(1000);

      waitsFor(function() {
        return tagsWereLoaded;
      }, "tags to load", 10000);

    });

    afterEach(function() {
      wrapper.remove();
    });

  });
});