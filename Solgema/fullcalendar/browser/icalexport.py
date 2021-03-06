from zope.i18n import translate
from zope.component import getAdapters

from Products.CMFCore.utils import getToolByName
from Products.Five.browser import BrowserView
try:
    from Products.ATContentTypes.lib import calendarsupport as calendarconstants
except ImportError:
    from plone.app.event.interfaces import ICalendarSupport
    from plone.event import constants as calendarconstants

from plone.app.layout.viewlets.common import ViewletBase

from Solgema.fullcalendar.config import _
from Solgema.fullcalendar.interfaces import IEventSource

from Products.CMFPlone import PloneMessageFactory as PMF

class ICalExportButton(ViewletBase):


    def render(self):
        msg = translate(_('title_add_to_ical',
                          default=u"Download this calendar in iCal format"),
                        context=self.request)
        title = translate(_(u"iCal export"), context=self.request)
        title_print = 'Imprimir as pr&oacute;ximas reservas.'
        url = self.context.absolute_url()
        portal_url = getToolByName(self.context, 'portal_url')()
        return """
                <a id="sfc-ical-export"
                   class="visualNoPrint"
                   title="%(msg)s"
                   href="%(url)s/ics_view">
                    <img width="16" height="16" title="%(title)s" alt="%(title)s"
                         src="%(portal_url)s/icon_export_ical.png">
                <span>%(title)s</span></a>
                
                <a onclick="window.open('%(url)s/print_reservations', 'Imprimir', 'STATUS=NO, TOOLBAR=NO, LOCATION=NO, DIRECTORIES=NO, RESISABLE=YES, SCROLLBARS=YES, TOP=50, LEFT=50, WIDTH=700, HEIGHT=600');"
                   id="sfc-ical-export"
                   class="visualNoPrint"
                   title="%(title_print)s"
                   style="margin-right: 10px; cursor: pointer;">
                    <img width="16" height="16" title="%(title_print)s" alt="%(title_print)s"
                         src="%(portal_url)s/print_icon.png">
                    <span>Imprimir</span>
                <a>
                
                
               """ % {'msg': msg, 'title': title,'title_print': title_print,
                      'url': url, 'portal_url': portal_url}



class ICalExport(BrowserView):

    def update(self):
        context = self.context
        self.iscalendarlayout = context.unrestrictedTraverse('iscalendarlayout')()
        if self.iscalendarlayout:
            self.sources = [source for name, source
                                in getAdapters((self.context, self.request),
                                               IEventSource)]
        else:
            catalog = getToolByName(context, 'portal_catalog')
            if 'object_provides' in catalog.indexes():
                query = {'object_provides': ICalendarSupport.__identifier__}
            else:
                query = {'portal_type': 'Event'}
            self.events = context.queryCatalog(**query)

    def render(self):
        self.update()       # collect events
        context = self.context
        request = self.request
        name = '%s.ics' % context.getId()
        request.RESPONSE.setHeader('Content-Type', 'text/calendar')
        request.RESPONSE.setHeader('Content-Disposition', 'attachment; filename="%s"' % name)
        request.RESPONSE.write(self.feeddata())

    def feeddata(self):
        context = self.context

        if self.iscalendarlayout:
            data = calendarconstants.ICS_HEADER % dict(prodid=calendarconstants.PRODID)
            data += 'X-WR-CALNAME:%s\n' % context.Title()
            data += 'X-WR-CALDESC:%s\n' % context.Description()
            for source in self.sources:
                if hasattr(source, 'getICal'):
                    data += source.getICal()

            data += calendarconstants.ICS_FOOTER
            return str(data)
        else:
            data = calendarconstants.ICS_HEADER % dict(prodid=calendarconstants.PRODID)
            data += 'X-WR-CALNAME:%s\n' % context.Title()
            data += 'X-WR-CALDESC:%s\n' % context.Description()
            for brain in self.events:
                data += brain.getObject().getICal()

            data += calendarconstants.ICS_FOOTER
            return str(data)

    __call__ = render