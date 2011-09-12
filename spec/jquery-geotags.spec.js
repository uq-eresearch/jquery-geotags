describe('jquery-w3cdtf', function() {

  it('is a jquery plugin', function() {
    expect(typeof ($.fn.geotags)).toBe('function');
  });

  describe('initialization', function() {
    var wrapper = null;
    var initialElement = null;

    beforeEach(function() {
      wrapper = $('<div/>');
      $('body').append(wrapper);
      initialElement = $('<div/>');
      wrapper.append(initialElement);
    });

    it('uses the existing class as a container', function() {

      expect($('div', wrapper).length).toBe(1);
      $(initialElement).geotags({});
      expect($('div', wrapper).length >= 1).toBeTruthy();

      expect($('div input', wrapper).length).toBe(0);
      console.debug($(initialElement).data('geotags'));
      $(initialElement).data('geotags').addTag('Mosnang',
          'http://www.geonames.org/7286562', true);
      expect($('div input', wrapper).length).toBe(2);
      expect($('div input:hidden[name="label"]', wrapper).val())
          .toBe('Mosnang');
      expect($('div input:hidden[name="href"]', wrapper).val()).toBe(
          'http://www.geonames.org/7286562');
      expect($('div button', wrapper).last().text()).toBe('Mosnang');
    });

    afterEach(function() {
      wrapper.remove();
    });

  });
});