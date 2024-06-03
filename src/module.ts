import { Field, FieldType, PanelPlugin } from '@grafana/data';
import { MapOptions } from './types';
import { MappaPanel } from './components/MappaPanel';

export const plugin = new PanelPlugin<MapOptions>(MappaPanel)
  .setPanelOptions((builder, context) => {
    builder
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
      .addTextInput({
        path: 'tooltipFields',
        name: 'Tooltip fields',
        description: 'Insert field names separated by commas (case sensitive)',
      })
      .addColorPicker({
        path: 'dotsColor',
        name: 'Dots color',
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
      .addColorPicker({
        path: 'bassoColor',
        name: 'GeoJSON rischio basso color',
      })
      .addColorPicker({
        path: 'medioColor',
        name: 'GeoJSON rischio medio color',
      })
      .addColorPicker({
        path: 'altoColor',
        name: 'GeoJSON rischio alto color',
      })
      .addColorPicker({
        path: 'indefinitoColor',
        name: 'GeoJSON rischio indefinito color',
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
  });
