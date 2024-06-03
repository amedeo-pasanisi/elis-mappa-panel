import "./styles.css"
import "leaflet/dist/leaflet.css"
import React, { useEffect, useState } from 'react'
import { Field, PanelProps } from '@grafana/data'
import { MapOptions } from 'types'
import { PanelDataErrorView } from '@grafana/runtime'
import { MapContainer, TileLayer, Tooltip, GeoJSON, CircleMarker, ZoomControl, } from 'react-leaflet'
import { random } from "lodash"
import { useTheme2 } from '@grafana/ui'

interface Props extends PanelProps<MapOptions> {}
export const MappaPanel: React.FC<Props> = ({ data, fieldConfig, id, options }) => {
    const theme = useTheme2()
    const [dots, setDots] = useState<Array<{
        dotCoords: [number, number] | undefined
        tooltipFields: Array<{label: string, value: string}>
    }>>([])
    const [geoJSON, setGeoJSON] = useState()

    useEffect(() => {
        fetch(options.geoJSONUrl)
            .then(response => response.json())
            .then(data => setGeoJSON(data))
            .catch(error => console.error('Error fetching geoJSON:', error))
        return setGeoJSON(undefined)
    }, [options.geoJSONUrl])

    useEffect(() => {
        console.log('DATA', data)
        const fields = data.series.flatMap(item => item.fields)
        const latitudeField = fields.find((field: Field | undefined) => field?.name === options.latitude)
        const longitudeField = fields.find((field: Field | undefined) => field?.name === options.longitude)
        if (latitudeField && longitudeField) {
            const coords: Array<[number, number] | undefined> = latitudeField.values.map((latitude, index) => {
                if (latitude && (longitudeField.values?.[index] || longitudeField.values?.buffer?.[index])) {
                    return [latitude, longitudeField.values?.[index] || longitudeField.values?.buffer?.[index]]
                }
            }) || []
            console.log('COORDS', coords)
            if (coords.length > 0) {
                const selectedTooltipFields = options.tooltipFields?.split(',').map(tooltipField => tooltipField.trim()) || []
                const dotsData = coords.map((coord, index) => {
                    return {
                        dotCoords: coord,
                        tooltipFields: selectedTooltipFields.map(selectedTooltipField => {
                            const field = fields.find(field => field?.name === selectedTooltipField)
                            const value = field?.values?.[index] || field?.values?.buffer?.[index] || 'no field was found'
                            return {label: selectedTooltipField, value}
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
        <MapContainer center={[42.83333, 12.83333]} zoom={5} scrollWheelZoom attributionControl= {false}>
            <TileLayer url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png' />
            {dots?.map(dot => (
                dot.dotCoords?.[0] && dot.dotCoords?.[1] &&
                <CircleMarker
                    center={dot.dotCoords}
                    pathOptions={{
                        stroke: false,
                        fillColor:  theme.visualization.getColorByName(options.dotsColor || '#0C419A'),
                        fillOpacity: options.dotsOpacity ?? 1.5
                    }}
                    radius={options.dotsRadius ?? 9}
                    pane='markerPane'
                    key={`${dot.dotCoords}_${random(dot.dotCoords[0])}`}
                >
                    {(dot.tooltipFields.length || undefined) &&
                        <Tooltip>
                            <ul style={{listStyleType: 'none'}}>
                                {dot.tooltipFields.map(tooltipField => {
                                    return <li key={`${tooltipField.label}_${tooltipField.value}`}>{tooltipField.label}: {tooltipField.value}</li>
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
