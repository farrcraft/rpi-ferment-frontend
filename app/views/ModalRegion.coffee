module.exports = class ModalRegion extends Backbone.Marionette.Region
  el: '#modal'

  constructor: () ->
    @on 'show', @showModal, @

  getEl: (selector) =>
    $el = $ selector
    $el.on 'hidden', @close
    $el

  showModal: (view) =>
    view.on 'close', @hideModal, @
    @$el.modal 'show'
    # fix vertical centering of modal
    @$el.css('margin-top', (@$el.outerHeight()/2)*-1)
    @$el.css('margin-left', (@$el.outerWidth()/2)*-1)
    @$el.css('top', '50%')

  hideModal: () =>
    @$el.modal 'hide'
