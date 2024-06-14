import { Field, FieldType, PanelPlugin } from '@grafana/data';
import { MapOptions } from './types';
import { MappaPanel } from './components/MappaPanel';

export const plugin = new PanelPlugin<MapOptions>(MappaPanel)
  .setPanelOptions((builder) => {
    builder
      .addNumberInput({
        path: 'initialLatitude',
        name: 'Initial Latitude'
      })
      .addNumberInput({
        path: 'initialLongitude',
        name: 'Initial Longitude'
      })
      .addNumberInput({
        path: 'zoom',
        name: 'Initial Zoom'
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
        defaultValue: '#0C419A',
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
      .addColorPicker({
        path: 'bassoColor',
        name: 'GeoJSON rischio basso color',
        defaultValue: 'green',
      })
      .addTextInput({
        path: 'bassoText',
        name: 'GeoJSON rischio basso text',
      })
      .addColorPicker({
        path: 'medioColor',
        name: 'GeoJSON rischio medio color',
        defaultValue: 'super-light-orange',
      })
      .addTextInput({
        path: 'medioText',
        name: 'GeoJSON rischio medio text',
      })
      .addColorPicker({
        path: 'altoColor',
        name: 'GeoJSON rischio alto color',
        defaultValue: 'red'
      })
      .addTextInput({
        path: 'altoText',
        name: 'GeoJSON rischio alto text',
      })
      .addColorPicker({
        path: 'indefinitoColor',
        name: 'GeoJSON rischio indefinito color',
        defaultValue: 'black',
      })
      .addTextInput({
        path: 'indefinitoText',
        name: 'GeoJSON rischio indefinito text',
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
        path: 'legendaTooltipText',
        name: 'Legenda info text',
        description: 'To wrap text insert <br/>'
      })
  });
