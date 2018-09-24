import React from 'react'
import PropTypes from 'prop-types'
import mapboxgl from 'mapbox-gl'
import mapStyle from 'mapbox-gl/dist/mapbox-gl.css'
import computeBbox from '@turf/bbox'

class AdressesCommuneMap extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      features: PropTypes.array.isRequired
    }).isRequired,
    select: PropTypes.func.isRequired,
    selected: PropTypes.object
  }

  static defaultProps = {
    selected: null
  }

  componentDidMount() {
    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'https://openmaptiles.geo.data.gouv.fr/styles/osm-bright/style.json'
    })

    this.map.once('load', this.onLoad)
    this.fitBounds()

    this.map.on('mousemove', 'circle', this.onMouseMove.bind(this, 'circle'))
    this.map.on('mouseleave', 'circle', this.onMouseLeave.bind(this, 'circle'))
    this.map.on('click', 'circle', this.onClick.bind(this, 'circle'))
  }

  componentDidUpdate(prevProps) {
    const {selected} = this.props

    if (selected !== prevProps.selected) {
      const source = this.map.getSource('selected')

      if (selected) {
        source.setData({
          type: 'Point',
          coordinates: selected.positions[0].coords
        })
        this.map.setCenter(selected.positions[0].coords)
        this.map.setZoom(16)
      } else {
        source.setData({
          type: 'Point',
          coordinates: null
        })
        this.fitBounds()
      }
    }
  }

  componentWillUnmount() {
    const {map} = this

    map.off('mousemove', 'circle', this.onMouseMove.bind(this, 'circle'))
    map.off('mouseleave', 'circle', this.onMouseLeave.bind(this, 'circle'))
    map.off('click', 'circle', this.onClick.bind(this, 'circle'))
  }

  fitBounds = () => {
    const {data} = this.props
    const bbox = computeBbox(data)

    this.map.fitBounds(bbox, {
      padding: 30,
      linear: true,
      duration: 0
    })
  }

  onLoad = () => {
    const {map} = this
    const {data, selected} = this.props

    map.addSource('data', {
      type: 'geojson',
      generateId: true,
      data
    })

    map.addSource('selected', {
      type: 'geojson',
      data: selected ? {
        type: 'Point',
        coordinates: selected.positions[0].coords
      } : null
    })

    map.addLayer({
      id: 'circle',
      type: 'circle',
      source: 'data',
      paint: {
        'circle-color': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          '#2c3e50',
          '#3099df'
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          30,
          100,
          40,
          750,
          50
        ]
      }
    })

    map.addLayer({
      id: 'selected',
      type: 'circle',
      source: 'selected',
      paint: {
        'circle-color': '#2c3e50',
        'circle-radius': 10
      }
    })
  }

  onMouseMove = (layer, event) => {
    const {map} = this
    const canvas = map.getCanvas()
    canvas.style.cursor = 'pointer'

    const [feature] = event.features

    if (this.highlighted) {
      map.setFeatureState({source: 'data', id: this.highlighted}, {hover: false})
    }

    this.highlighted = feature.id
    map.setFeatureState({source: 'data', id: this.highlighted}, {hover: true})
  }

  onMouseLeave = () => {
    const {map} = this
    const canvas = map.getCanvas()
    canvas.style.cursor = ''

    if (this.highlighted) {
      map.setFeatureState({source: 'data', id: this.highlighted}, {hover: false})
    }
  }

  onClick = (layer, event) => {
    const {select} = this.props
    const [feature] = event.features

    const {codeCommune, codeVoie, numeroComplet} = feature.properties

    select(codeCommune, codeVoie, numeroComplet)
  }

  render() {
    return (
      <div className='container'>
        <div ref={el => {
          this.mapContainer = el
        }} className='container' />

        <style
          dangerouslySetInnerHTML={{__html: mapStyle}} // eslint-disable-line react/no-danger
        />
        <style jsx>{`
          .container {
            position: relative;
            height: 100%;
            width: 100%;
          }
          .info {
            position: absolute;
            pointer-events: none;
            top: 10px;
            left: 10px;
            max-width: 40%;
            overflow: hidden;
          }
        `}</style>
      </div>
    )
  }
}

export default AdressesCommuneMap