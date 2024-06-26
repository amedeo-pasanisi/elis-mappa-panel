import "./styles.css"
import "leaflet/dist/leaflet.css"
import React, { useEffect, useMemo, useState } from 'react'
import { Field, FieldType, PanelProps } from '@grafana/data'
import { MapOptions } from 'types'
import { PanelDataErrorView } from '@grafana/runtime'
import { MapContainer, TileLayer, Tooltip, GeoJSON, CircleMarker } from 'react-leaflet'
import { random } from "lodash"
import { useTheme2 } from '@grafana/ui'
import type { FeatureCollection } from 'geojson';
import svgInfoIcon from './info.svg'
import 'react-tooltip/dist/react-tooltip.css'
import { Tooltip as ReactTooltip } from 'react-tooltip'
import Color from "colorjs.io"

interface MapPanelProps extends PanelProps<MapOptions> {}
export const MappaPanel: React.FC<MapPanelProps> = ({ data, fieldConfig, id, options }) => {
    const theme = useTheme2()
    const [dots, setDots] = useState<Array<{
        dotColor: string,
        dotCoord: [number, number] | undefined
        tooltipFields: Array<{label: string, fieldValue: string | string[]}>
    }>>([])
    const [geoJSON, setGeoJSON] = useState<FeatureCollection>()
    const [legendElements, setLegendElements] = useState<Array<{rischio: string | undefined, color: string}>>([])
    const [mouseOver, setMouseOver] = useState(false)

    const takeColorFromRange = useMemo(() => {
        const minColor = theme.visualization.getColorByName(options.dotsMinValueColor || '')
        const maxColor = theme.visualization.getColorByName(options.dotsMaxValueColor || '')
        let c1 = new Color(minColor);
        let c2 = new Color(maxColor)
        return c1.range(c2, {space: "hwb"})
    }, [options.dotsMaxValueColor, options.dotsMinValueColor, theme.visualization])

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
        if (geoJSON) {
            const rischioTypes: Array<string | undefined> = []
            if (geoJSON.features) {
                geoJSON.features.forEach(feature => {
                    if (feature.properties?.rischio && !rischioTypes.includes(feature.properties.rischio)) {
                        rischioTypes.push(feature.properties.rischio)
                    }
                })
                rischioTypes.push(undefined)
            } else {console.error('Geojson has no features')}
            if (rischioTypes.length > 0) {
                const elements = rischioTypes.map(rischioType => {
                    switch (rischioType) {
                        case 'BASSO':
                            return {rischio: 'BASSO', color: theme.visualization.getColorByName(options.bassoColor || '') }
                        case 'MEDIO':
                            return {rischio: 'MEDIO', color: theme.visualization.getColorByName(options.medioColor || '') }
                        case 'ALTO':
                            return {rischio: 'ALTO', color: theme.visualization.getColorByName(options.altoColor || '')}
                        default:
                            return {rischio: 'INDEFINITO', color: theme.visualization.getColorByName(options.indefinitoColor || '') }
                    }
                })
                setLegendElements(elements)
            }
        } else {
            setLegendElements([])
        }
    }, [geoJSON, options.bassoColor, options.medioColor, options.altoColor, options.indefinitoColor, theme.visualization])

    useEffect(() => {
        const fields = data.series.flatMap(item => item.fields)
        console.log('FIELDS', fields)
        const latitudeField = fields.find((field: Field) => field?.name === options.latitude)
        const longitudeField = fields.find((field: Field) => field?.name === options.longitude)
        console.groupCollapsed('FIELDNAME-OPTIONSVALUEFIELD')
        const valuesField = fields.find((field: Field) => {
            console.log('field?.name', field?.name)
            console.log('dotsValuesField', options.dotsValuesField)
            return field?.name === options.dotsValuesField
        })
        console.groupEnd()
        console.log('valuesField',valuesField)
        if (
            latitudeField?.type === FieldType.number &&
            longitudeField?.type === FieldType.number
        ) {
            const longitudes: number[] = longitudeField.values.toArray()
            const latitudes: number[] = latitudeField.values.toArray()
            const coords: Array<[number, number] | undefined> = latitudes.map((latitude, index) => {
                return (latitude != null && longitudes[index] != null) ? [latitude, longitudes[index]] : undefined
            }) || []
            let dotsValues: (number[] | undefined)
            if (valuesField) {
                dotsValues = valuesField.values.toArray()
            }
            console.log('DOTSVALUES', dotsValues)
            console.log('DOTSVALUESLENGTH', dotsValues?.length)
            console.log('COORDS', coords)
            console.log('COORDSLENGTH', coords?.length)
            if (coords.length > 0) {
                const selectedTooltipFields = options.tooltipFields?.split(',').map(tooltipField => tooltipField.trim()) || []
                const minDotsValue = dotsValues ? Math.min(...dotsValues.filter(value => value != undefined && !isNaN(value))) : undefined
                console.log('MIN', minDotsValue)
                const maxDotsValue = dotsValues ? Math.max(...dotsValues.filter(value => value != undefined && !isNaN(value))) : undefined
                console.log('MAX', maxDotsValue)
                console.groupCollapsed('normalizedValues')
                const dotsData = coords.map((coord, index) => {
                    let normalizedColorValue
                    let dotColor = options.dotsDefaultColor || ''
                    if (dotsValues && minDotsValue != null && maxDotsValue != null && !isNaN(minDotsValue) && !isNaN(maxDotsValue)) {
                        normalizedColorValue = (dotsValues[index]-minDotsValue) / (maxDotsValue-minDotsValue)
                        console.log('coordinata', coord)
                        console.log('index', index)
                        console.log('dotsValues[index]', dotsValues[index])
                        console.log('normalizedColorValue',normalizedColorValue)
                        if (!dotsValues[index]) {
                            dotColor = options.dotsDefaultColor || ''
                        } else {
                            dotColor = normalizedColorValue || (normalizedColorValue === 0) ? takeColorFromRange(normalizedColorValue).toString() :  options.dotsDefaultColor || ''
                        }
                    }
                    return {
                        dotColor: dotColor,
                        dotCoord: coord,
                        tooltipFields: selectedTooltipFields.map(selectedTooltipField => {
                            const field = fields.find(field => field?.name === selectedTooltipField)
                            const value = field?.values.toArray()[index] || 'No field was found'
                            const fieldValue = typeof value === 'string' && value.includes(',') ? value.split(',').map(tooltipField => tooltipField.trim()) : value
                            return {label: selectedTooltipField, fieldValue}
                        })
                    }
                })
                console.groupEnd()
                setDots(dotsData)
            }
        }
    }, [data, data.series, options.latitude, options.longitude, options.tooltipFields, options.dotsValuesField, options.dotsDefaultColor, takeColorFromRange])

    if (data.series.length === 0) {
        return <PanelDataErrorView fieldConfig={fieldConfig} panelId={id} data={data} needsStringField />
    }

    return (
        <>
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
                            fillColor:  theme.visualization.getColorByName(dot.dotColor),
                            fillOpacity: options.dotsOpacity ?? 1.5
                        }}
                        radius={options.dotsRadius ?? 9}
                        pane='markerPane'
                        key={`${dot.dotCoord}_${random(dot.dotCoord[0])}`}
                    >
                        {dot.tooltipFields.length !== 0 &&
                            <Tooltip className="tooltip">
                                <ul>
                                    {dot.tooltipFields.map(tooltipField => {
                                        return <li key={`${tooltipField.label}_${tooltipField.fieldValue}`}>
                                            <span className="tooltipFieldLabel">{tooltipField.label}</span>: {' '}
                                            {Array.isArray(tooltipField.fieldValue) ?
                                                <ul style={{marginLeft: '15px', listStyleType: 'none'}} className={`${options.tooltipBoldField === tooltipField.label && 'boldText'}`}>
                                                    {tooltipField.fieldValue.map(e => <li key={e}>{e}</li>)}
                                                </ul> :
                                                <span className={`tooltipFieldValue ${options.tooltipBoldField === tooltipField.label && 'boldText'}`}>{tooltipField.fieldValue}</span>
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
                            fillOpacity: options.geojsonOpacity ?? 0.3,
                        }
                        switch (geoJsonFeature?.properties?.rischio) {
                            case 'BASSO':
                                return {...style, color: theme.visualization.getColorByName(options.bassoColor || '') }
                            case 'MEDIO':
                                return {...style, color: theme.visualization.getColorByName(options.medioColor || '') }
                            case 'ALTO':
                                return {...style, color: theme.visualization.getColorByName(options.altoColor || '')}
                            default:
                                return {...style, color: theme.visualization.getColorByName(options.indefinitoColor || '') }
                        }
                    }} />
                }
            </MapContainer>
            {legendElements.length !== 0 ? <div className={'legendContainer'} style={{zIndex: 197}}>
                <div onMouseOver={() => setMouseOver(true)} onMouseLeave={() => setMouseOver(false)} style={{zIndex: 198}}>
                    <img src={svgInfoIcon} alt="info icon" className="infoIcon" data-tooltip-place="top" style={{zIndex: 199}}/>
                    <div style={{maxWidth: '150px', textWrap: 'wrap'}}>{options.legendaTitleText}</div>
                </div>
                <ReactTooltip isOpen={mouseOver} place="top" style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', backgroundColor: 'white', color: '#555', zIndex: 200}} className="reactTooltip" anchorSelect=".infoIcon">
                    {options.legendaTooltipText?.split('<br/>').map((text, index) => <div key={`${index}_${text}`}>{text}</div>)}
                </ReactTooltip>
                <ul className="legend">
                    {legendElements.map((legendElement) => {
                        return <>
                            <i style={{background: legendElement.color}}></i>
                            {legendElement.rischio === 'BASSO' && options.bassoText}
                            {legendElement.rischio === 'MEDIO' && options.medioText}
                            {legendElement.rischio === 'ALTO' && options.altoText}
                            {legendElement.rischio === 'INDEFINITO' && options.indefinitoText}
                            <br />
                        </>
                    })}
                </ul>
            </div> : undefined}
        </>
    )
    }
