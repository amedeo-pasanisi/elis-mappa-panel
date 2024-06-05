import "./styles.css"
import "leaflet/dist/leaflet.css"
import React, { useEffect, useState } from 'react'
import { Field, FieldType, PanelProps } from '@grafana/data'
import { MapOptions } from 'types'
import { PanelDataErrorView } from '@grafana/runtime'
import { MapContainer, TileLayer, Tooltip, GeoJSON, CircleMarker } from 'react-leaflet'
import { random } from "lodash"
import { useTheme2 } from '@grafana/ui'


interface MapPanelProps extends PanelProps<MapOptions> {}
export const MappaPanel: React.FC<MapPanelProps> = ({ data, fieldConfig, id, options }) => {
    const theme = useTheme2()
    const [dots, setDots] = useState<Array<{
        dotCoord: [number, number] | undefined
        tooltipFields: Array<{label: string, fieldValue: string | string[]}>
    }>>([])
    const [geoJSON, setGeoJSON] = useState()

    useEffect(() => {
        if (options.geoJSONUrl) {
            fetch(options.geoJSONUrl)
                .then(response => response.json())
                .then(data => setGeoJSON(data))
                .catch(error => console.error('Error fetching geoJSON:', error))
            return setGeoJSON(undefined)
        }
    }, [options.geoJSONUrl])

    useEffect(() => {
        console.log('DATA', data)
        const fields = data.series.flatMap(item => item.fields)
        const latitudeField = fields.find((field: Field) => field?.name === options.latitude)
        const longitudeField = fields.find((field: Field) => field?.name === options.longitude)
        if (
            latitudeField?.type === FieldType.number &&
            longitudeField?.type === FieldType.number
        ) {
            const longitudes = longitudeField.values.toArray()
            const latitudes = latitudeField.values.toArray()
            const coords: Array<[number, number] | undefined> = latitudes.map((latitude, index) => {
                return (latitude != null && longitudes[index] != null) ? [latitude, longitudes[index]] : undefined
            }) || []
            console.log('COORDS', coords)
            if (coords.length > 0) {
                const selectedTooltipFields = options.tooltipFields?.split(',').map(tooltipField => tooltipField.trim()) || []
                const dotsData = coords.map((coord, index) => {
                    return {
                        dotCoord: coord,
                        tooltipFields: selectedTooltipFields.map(selectedTooltipField => {
                            const field = fields.find(field => field?.name === selectedTooltipField)
                            const value = field?.values.toArray()[index] || 'No field was found'
                            const fieldValue = typeof value === 'string' && value.includes(',') ? value.split(',').map(tooltipField => tooltipField.trim()) : value
                            return {label: selectedTooltipField, fieldValue}
                        })
                    }
                })
                setDots(dotsData)
            }
        }
    }, [data, data.series, options.latitude, options.longitude, options.tooltipFields])

    if (data.series.length === 0) {
        return <PanelDataErrorView fieldConfig={fieldConfig} panelId={id} data={data} needsStringField />
    }

    return (
        <MapContainer
            style={{zIndex: 0}}
            center={[options.initialLatitude || 41.662544, options.initialLongitude || 14.148338]}
            zoom={options.zoom || 5.9}
            scrollWheelZoom
            attributionControl= {false}
        >
            <TileLayer url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png' />
            {dots?.map(dot => (
                dot.dotCoord &&
                <CircleMarker
                    center={dot.dotCoord}
                    pathOptions={{
                        stroke: false,
                        fillColor:  theme.visualization.getColorByName(options.dotsColor || '#0C419A'),
                        fillOpacity: options.dotsOpacity ?? 1.5
                    }}
                    radius={options.dotsRadius ?? 9}
                    pane='markerPane'
                    key={`${dot.dotCoord}_${random(dot.dotCoord[0])}`}
                >
                    {dot.tooltipFields.length !== 0 &&
                        <Tooltip>
                            <ul style={{listStyleType: 'none'}}>
                                {dot.tooltipFields.map(tooltipField => {
                                    return <li key={`${tooltipField.label}_${tooltipField.fieldValue}`}>
                                        {tooltipField.label}:
                                        {Array.isArray(tooltipField.fieldValue) ?
                                            <ul style={{marginLeft: '15px', listStyleType: 'none'}}>
                                                {tooltipField.fieldValue.map(e => <li key={e}>{e}</li>)}
                                            </ul> :
                                            tooltipField.fieldValue
                                        }
                                    </li>
                                })}
                            </ul>
                        </Tooltip>
                    }
                </CircleMarker>
            ))}
            {geoJSON &&
                <GeoJSON data={geoJSON} style={geoJsonFeature => {
                    const style = {
                        weight: options.geojsonStrokesWeight ?? 1.5,
                        opacity: options.geojsonOpacity ?? 0.3,
                        fillOpacity: options.geojsonOpacity ?? 0.3
                    }
                    switch (geoJsonFeature?.properties?.rischio) {
                        case 'BASSO':
                            return {...style, color: theme.visualization.getColorByName(options.bassoColor || 'green') }
                        case 'MEDIO':
                            return {...style, color: theme.visualization.getColorByName(options.medioColor ||'super-light-orange') }
                        case 'ALTO':
                            return {...style, color: theme.visualization.getColorByName(options.altoColor ||'red')}
                        default:
                            return {...style, color: theme.visualization.getColorByName(options.indefinitoColor ||'black') }
                    }
                }} />
            }
        </MapContainer>
    )
    }
