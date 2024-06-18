import { Field, FieldType, PanelPlugin } from '@grafana/data';
import { MapOptions } from './types';
import { MappaPanel } from './components/MappaPanel';

export const plugin = new PanelPlugin<MapOptions>(MappaPanel)
  .setPanelOptions((builder) => {
    builder
      .addNumberInput({
        path: 'initialLatitude',
        name: 'Initial map Latitude'
      })
      .addNumberInput({
        path: 'initialLongitude',
        name: 'Initial map Longitude'
      })
      .addNumberInput({
        path: 'zoom',
        name: 'Initial map Zoom'
      })
      .addFieldNamePicker({
        path: `latitude`,
        name: 'Dots latitude field',
        settings: {
          filter: (f: Field) => f.type === FieldType.number,
          noFieldsMessage: 'No numeric fields found',
        },
      })
      .addFieldNamePicker({
        path: `longitude`,
        name: 'Dots longitude field',
        settings: {
          filter: (f: Field) => f.type === FieldType.number,
          noFieldsMessage: 'No numeric fields found',
        },
      })
      .addFieldNamePicker({
        path: 'dotsValuesField',
        name: 'Dots value field',
        description: 'Chose a numeric field to assign a value to every dot',
      })
      .addColorPicker({
        path: 'dotsDefaultColor',
        name: 'Dots Default value color',
        description: 'Default color if the dot value is not defined',
        defaultValue: '#0C419A',
      })
      .addTextInput({
        path: 'tooltipFields',
        name: 'Tooltip fields',
        description: 'Insert field names separated by commas (case sensitive)',
      })
      .addFieldNamePicker({
        path: 'tooltipBoldField',
        name: 'Tooltip bold field',
        description: 'Chose wich tooltip field should be bold',
      })
      .addSliderInput({
        path: 'dotsRadius',
        name: 'Dots radius',
        settings: {
          min: 0,
          max: 10
        },
        defaultValue: 9
      })
      .addSliderInput({
        path: 'dotsOpacity',
        name: 'Dots opacity',
        settings: {
          min: 0,
          max: 1,
          step: 0.1
        },
        defaultValue: 1
      })
      .addTextInput({
        path: 'geoJSONUrl',
        name: 'GeoJSON Url',
      })
      .addColorPicker({
        path: 'bassoColor',
        name: 'GeoJSON rischio basso color',
        defaultValue: 'green',
      })
      .addTextInput({
        path: 'bassoText',
        name: 'GeoJSON rischio basso legend text',
      })
      .addColorPicker({
        path: 'medioColor',
        name: 'GeoJSON rischio medio color',
        defaultValue: 'super-light-orange',
      })
      .addTextInput({
        path: 'medioText',
        name: 'GeoJSON rischio medio legend text',
      })
      .addColorPicker({
        path: 'altoColor',
        name: 'GeoJSON rischio alto color',
        defaultValue: 'red'
      })
      .addTextInput({
        path: 'altoText',
        name: 'GeoJSON rischio alto legend text',
      })
      .addColorPicker({
        path: 'indefinitoColor',
        name: 'GeoJSON rischio indefinito color',
        defaultValue: 'black',
      })
      .addTextInput({
        path: 'indefinitoText',
        name: 'GeoJSON rischio indefinito legend text',
      })
      .addSliderInput({
        path: 'geojsonStrokesWeight',
        name: 'GeoJSON strokes weight',
        settings: {
          min: 0,
          max: 3,
          step: 0.1,
        },
        defaultValue: 1.5
      })
      .addSliderInput({
        path: 'geojsonOpacity',
        name: 'GeoJSON opacity',
        settings: {
          min: 0,
          max: 1,
          step: 0.1,
        },
        defaultValue: 0.3
      })
      .addTextInput({
        path: 'legendaTitleText',
        name: 'Legenda title text',
        defaultValue: 'Legenda'
      })
      .addTextInput({
        path: 'legendaTooltipText',
        name: 'Legenda info text',
        description: 'To wrap text insert <br/>'
      })
  });
