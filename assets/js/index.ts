import * as govukFrontend from 'govuk-frontend'
import * as mojFrontend from '@ministryofjustice/frontend'
import * as pfsComponents from '@ministryofjustice/hmpps-prisoner-facing-components/dist/assets/js/all'
import * as connectDps from '@ministryofjustice/hmpps-connect-dps-shared-items/dist/assets/js/all'

govukFrontend.initAll()
mojFrontend.initAll()
pfsComponents.initAll()
connectDps.initAll()

document.addEventListener('DOMContentLoaded', () => {
  const manualLink = document.getElementById('enter-address-manually-link')
  const lookupLink = document.getElementById('lookup-address-link')
  const manualFields = document.getElementById('manual-address-fields')
  const lookupSection = document.getElementById('address-lookup-section')

  if (!manualLink || !manualFields || !lookupSection) return

  const showManualFields = () => {
    manualFields.classList.remove('govuk-!-display-none')
    lookupSection.classList.add('govuk-!-display-none')
  }

  const showLookupSection = () => {
    manualFields.classList.add('govuk-!-display-none')
    lookupSection.classList.remove('govuk-!-display-none')
  }

  manualLink.addEventListener('click', e => {
    e.preventDefault()
    showManualFields()
  })

  if (lookupLink) {
    lookupLink.addEventListener('click', e => {
      e.preventDefault()
      showLookupSection()
    })
  }
})
