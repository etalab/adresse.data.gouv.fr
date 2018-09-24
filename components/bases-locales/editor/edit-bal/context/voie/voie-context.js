import React from 'react'
import PropTypes from 'prop-types'

import getStatus from '../../../../../../lib/bal/item'
import Notification from '../../../../../notification'
import Button from '../../../../../button'

import Head from '../head'

import NumerosList from './numeros-list'
import EmptyNumeroList from './empty-numeros-list'

class VoieContext extends React.Component {
  static propTypes = {
    commune: PropTypes.shape({
      nom: PropTypes.string.isRequired,
      code: PropTypes.string.isRequired
    }).isRequired,
    voie: PropTypes.shape({
      nomVoie: PropTypes.string.isRequired,
      numeros: PropTypes.object
    }).isRequired,
    actions: PropTypes.shape({
      addItem: PropTypes.func.isRequired,
      cancelChange: PropTypes.func.isRequired,
      select: PropTypes.func.isRequired
    }).isRequired,
    contour: PropTypes.object
  }

  static defaultProps = {
    contour: null
  }

  render() {
    const {commune, voie, contour, actions} = this.props
    const {numeros} = voie
    const hasNumero = numeros && Object.keys(numeros).length > 0
    const newName = voie.modified && voie.modified.nomVoie

    return (
      <div>
        <Head
          name={newName ? voie.modified.nomVoie : voie.nomVoie}
          status={getStatus(voie)}
          parent={commune.nom}
          previous={() => actions.select(commune.code)}
        />

        {newName && (
          <Notification type='info'>
            <div>
              <p>Anciennement nommée <b>{voie.nomVoie}</b>, vous avez renommé cette voie.</p>
              <Button
                size='small'
                onClick={() => actions.cancelChange(voie)}
              >
                Revenir au nom original
              </Button>
            </div>
          </Notification>
        )}

        {hasNumero ? (
          <NumerosList
            codeCommune={commune.code}
            codeVoie={voie.codeVoie}
            numeros={numeros}
            contour={contour}
            actions={actions}
          />
        ) : (
          <EmptyNumeroList
            contour={contour}
            addNumero={actions.addItem}
          />
        )}
      </div>

    )
  }
}

export default VoieContext