import { elementClass, getLabelHeight, getRubyHeight, isString } from '../util';

export let calc = {
  name: 'calc',
  // key: 'output',
  defaults: {
    output: {},
    layout: 'left',
    inline: false,
    inputs: [],
    blk: true,
  },
  render(args, reg, doc) {
    args.lp = getLabelHeight(args);
    args.rb = getRubyHeight(args);

    args.calc = true;
    const cls = elementClass('row', null, args, ["calc", "inline", "blk"], { 'layout': 'center', 'lp': '', 'rb': '' });

    // parts of the calculation
    const outputPart = Object.assign({
      border: "full"
    }, args.output);
    // log("-","Output:", output);

    const inputParts = args.inputs.map(part => {
      if (isString(part)) {
        return {
          "type": "span",
          "content": part
        };
      }
      return part;
    });

    const parts = [
      outputPart,
      {
        "type": "span",
        "content": "="
      },
      ...inputParts
    ]
    // log("-","Calculation contents", parts);

    // contextual args
    if (args.inline)
      args.field_frame = "inline";

    return `<div${cls}><div class='row__inner'>${reg.render(parts, doc)}<div class='spacer'></div></div></div>`;
  }
}
