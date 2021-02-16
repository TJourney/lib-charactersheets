import { fieldIdent, fieldRadioIdent, fieldDefaults } from './field';
import { log, warn, error } from '../log';
import { isArray, isNull, isBoolean } from '../util';
import { elementClass } from '../util/elements';
import { chunk } from '../util/arrays';
import { has } from '../util/objects';
import { toKebabCase } from '../util/strings';
import { __, _e, esc } from '../i18n';

function defaultControlRender (args, reg, doc) {
  args = Object.assign({
    align: "center",
    width: "medium",
    editable: true,
    eq: null,
    prefix: false,
    suffix: false,
    underlay: false,
  }, args);

  const ident = fieldIdent(args.id);
  const cls = elementClass("field", "control", args, [ "damage-die" ], { "align": "centre", "width": "" });
  const value = (args.value == '') ? '' : ` value='${_e(args.value, doc)}'`;
  const readonly = (args.editable && !(args.eg && doc.isCalc) ? '' : 'readonly');
  const ref = (args.ref ? ` ref='${args.ref}'` : '');
  const input = `<input${ident.ident}${ref}${value}${readonly}>`;

  const underlay = args.underlay ? `<u>${__(args.underlay, doc)}</u>` : '';

  const prefix = args.prefix ? `<span class='field__overlay'>${__(args.prefix, doc)}</span>` : '';
  const suffix = args.suffix ? `<span class='field__overlay'>${__(args.suffix, doc)}</span>` : '';

  return `${prefix}<div${cls}>${input}${underlay}</div>${suffix}`;
};

function renderCompoundControl(args, reg, doc) {
  const parts = args.parts;
  if (isNull(parts)) {
    error("field", "Compound control: no parts", args);
    return;
  }

  let i = 0;
  const outputParts = parts.map(part => {
    if (typeof part == 'string')
      return part;

    if (isArray(args.value) && args.value.length > i) {
      part.value = args.value[i];
    }
    i++;

    if (has(part, "type") && part.type != "field")
      return reg.renderItem(part, doc);

    part = fieldDefaults(part, reg);
    if (has(part, "subid")) {
      if (part.subid == "") {
        part.id = args.id;
      } else {
        part.id = args.id + "-" + part.subid;
      }
    }
    part.type = 'control:' + part.control;

    return reg.renderItem(part, doc);
  });

  // log("control", "Parts:", outputParts);
  return outputParts.join("");
};

// Register the faux-elements

export let field_control_input = {
  name: 'control:input',
  defaults: {
    value: '',
    border: 'bottom',
    typeHint: 'string',
  },
  render: defaultControlRender
}

export let field_control_value = {
  name: 'control:value',
  defaults: {
    value: '',
    border: 'none',
    typeHint: 'string',
  },
  render(args, reg, doc) {
    const cls = elementClass("field", "control", args, [], { "control": "", "align": "centre", "width": "" });

    const prefix = args.prefix ? `<span class='field__overlay'>${__(args.prefix, doc)}</span>` : '';
    const suffix = args.suffix ? `<span class='field__overlay'>${__(args.suffix, doc)}</span>` : '';
    const underlay = args.underlay ? `<u>${__(args.underlay, doc)}</u>` : '';

    const spancls = elementClass("span", null, args, [], {'size': 'medium'});
    if (isNull(args.value)) {
      error("field", "Value is undefined", args);
    } else if (isBoolean(args.value)) {
      error("field", "Value is a boolean", args);
    }
    const value = `<span${spancls}>${_e(args.value, doc)}</span>`;

    return `${prefix}<div${cls}>${value}${underlay}</div>${suffix}`;
  }
};

export let field_control_ref = {
  name: 'control:ref',
  defaults: {
    icon: "book",
    width: "huge",
    typeHint: 'string',
  },
  render(args, reg, doc) {
    let id = args.id;
    args.parts = [
      {
        type: "field",
        id: `${id}-book`,
        width: "large"
      },
      {
        type: "span",
        content: "_{p}"
      },
      {
        type: "field",
        id: `${id}-page`,
        width: "large",
        align: "left"
      }
    ];
    return renderCompoundControl(args, reg, doc);
  }
}

export let field_control_speed = {
  name: 'control:speed',
  defaults: {
    units: "imperial",
    value: '',
    width: 'large',
    typeHint: 'number',
  },
  render(args, reg, doc) {
    switch (args.units) {
      case "imperial": {
        const ftIdent = fieldIdent(args.id, "ft");
        const sqIdent = fieldIdent(args.id, "sq");

        args.parts = [
          {
            type: "field",
            id: ftIdent.id,
            align: "right",
            width: "small"
          },
          {
            type: "label",
            label: "_{ft}"
          },
          {
            type: "field",
            id: sqIdent.id,
            align: "right",
            width: "tiny"
          },
          {
            type: "label",
            label: "_{sq}"
          },
        ];
        break;
      }

      case "metric": {
        const ftIdent = fieldIdent(args.id, "m");
        const sqIdent = fieldIdent(args.id, "sq");

        args.parts = [
          {
            type: "field",
            id: ftIdent.id,
            align: "right",
            width: "small"
          },
          {
            type: "label",
            label: "_{m}"
          },
          {
            type: "field",
            id: sqIdent.id,
            align: "right",
            width: "tiny"
          },
          {
            type: "label",
            label: "_{sq}"
          },
        ];
        break;
      }
    }

    // log("field", "Speed field", args);
    return renderCompoundControl(args, reg, doc);
  }
}

export let field_control_weight = {
  name: 'control:weight',
  defaults: {
    schema: "bulk",
    width: "huge",
    typeHint: 'number',
  },
  render(args, reg, doc) {
    switch (args.schema) {
      case "bulk": {
        const bulkIdent = fieldIdent(args.id, "bulk");
        const lightIdent = fieldIdent(args.id, "light");

        args.parts = [
          {
            type: "field",
            id: bulkIdent.id,
            align: "right"
          },
          {
            type: "label",
            label: "_{B}",
          },
          {
            type: "field",
            id: lightIdent.id,
            align: "right",
            width: "tiny"
          },
          {
            type: "label",
            label: "_{L}",
          }
        ];
        break;
      }
    }

    return renderCompoundControl(args, reg, doc);
  }
}

export let field_control_enum = {
  name: 'control:enum',
  defaults: {
    options: [],
    default: '',
    value: '',
    border: 'bottom',
    typeHint: 'string',
  },
  render(args, reg, doc) {
    let options = args.options.map(opt => {
      let menuId = 'enum-menu-'+args.id;
      let slug = toKebabCase(opt.replace(/_\{(.*?(#\{.*?\}.*?)*)\}/gs, (m, p) => p));
      let title = __(opt, doc);
      return `<label for='${menuId}-${slug}'><input type='radio' name='${menuId}' value='${slug}' data-value='${_e(opt, doc)}' id='${menuId}-${slug}'> ${__(title, doc)}</label>`;
    });
    args.editable = false;
    return defaultControlRender(args, reg, doc)+`<div class='field--control_enum__options'>${options.join('')}</div>`;
  }
}

export let field_control_radio = {
  name: 'control:radio',
  defaults: {
    value: false,
    border: 'none',
    typeHint: 'string',
  },
  render(args) {
    const ident = fieldRadioIdent(args.id, args.value);
    const cls = elementClass("field", "control", args, [], ["control"]);
    return `<div${cls}><input type='radio'${ident.ident}><label${ident.for}></label></div>`;
  }
}

export let field_control_checkbox = {
  name: 'control:checkbox',
  defaults: {
    value: false,
    border: 'none',
    width: 'tiny',
    style: '',
    typeHint: 'boolean',
  },
  render(args) {
    const ident = fieldIdent(args.id);
    const cls = elementClass("field", "control", args, [], {control: '', style: ''});

    if (args.value == "false") {
      args.value = false;
    }
    const checked = args.value ? ' checked' : '';
    return `<div${cls}><input type='checkbox'${checked}${ident.ident}><label${ident.for}></label></div>`;
  }
}

export let field_control_boost = {
  name: 'control:boost',
  defaults: {
    value: false,
    up: true,
    down: true,
    border: 'none',
    typeHint: 'boolean',
  },
  render(args) {
    let up = '';
    if (args.up) {
      const upident = fieldIdent(args.id, "up");
      up = `<div class='field__control field__control--boost_up'><input type='checkbox' ${upident.ident}><label ${upident.for}></label></div>`
    }
    let down = '';
    if (args.down) {
      const downident = fieldIdent(args.id, "down");
      down = `<div class='field__control field__control--boost_down'><input type='checkbox' ${downident.ident}><label ${downident.for}></label></div>`
    }

    return `${down}${up}`;
  }
}

export let field_control_checkgrid = {
  name: 'control:checkgrid',
  defaults: {
    value: false,
    border: 'none',
    max: 10,
    group: 10,
    reduce: 0,
    direction: "horizontal",
    style: "",
    flex: "tiny",
    depth: 3,
    value: 0,
    typeHint: 'number',
  },
  render(args, reg, doc) {
    let g = args.group;
    if (doc.largePrint && args.reduce > 0) {
      args.max -= args.reduce;
    }
    if (args.max < args.group) g = args.max;
    let depth = args.depth;
    if (depth == "auto") {
      if (g <= 3) {
        depth = 1;
      } else if (g <= 6) {
        depth = 2;
      } else {
        depth = 3;
      }
    } else {
      depth = parseInt(depth);
    }

    const grouplen = Math.ceil(parseFloat(g) / parseFloat(args.depth));
    if (args.direction == "horizontal") {
      args.dir = "h";
      args.w = grouplen;
      args.h = depth;
    } else {
      args.dir = "v";
      args.h = grouplen;
      args.w = width;
    }

    let checks = [];
    for (let i = 1; i <= args.max; i++) {
      const ident = fieldIdent(args.id, i);
      const checked = (i <= args.value) ? ' checked' : '';
      let a = { ...args, control: 'checkbox' };
      const cls = elementClass("field", "control", a, [], {control: "", style: ""});
      const check = `<div${cls}><input type='checkbox'${ident.ident}${checked}><label${ident.for}></label></div>`;
      checks.push(check);
    }

    const groups = chunk(checks, args.group).map(ch => {
      const grouplen = Math.ceil(parseFloat(ch.length) / parseFloat(depth));
      let a = { control: 'checkgrid', dir: args.dir, w: args.w, h: args.h, style: args.style };
      a[args.direction == 'horizontal' ? 'w' : 'h'] = grouplen;
      const cls = elementClass("field", "control-group", a, [], {control: '', dir: '', w: '', h: '', style: ''});
      return `<div${cls}>${ch.join("")}</div>`
    });

    return groups.join("");
  }
}

export let field_control_alignment = {
  name: 'control:alignment',
  defaults: {
    value: '',
    border: 'none',
    typeHint: 'string',
    value: '',
  },
  render(args, reg, doc) {
    const radios = ["lg", "ln", "le", "ng", "nn", "ne", "cg", "cn", "ce"].map(al => {
      const radioIdent = fieldRadioIdent(args.id, al);
      const checked = (args.value == al) ? ' checked' : '';
      return `<div class='field__control field__control-${al}'><input type='radio'${radioIdent.ident}${checked}></div>`;
    });

    let fieldGridCls = "";
    if (args.value) {
      fieldGridCls = "field__grid--alignment_"+args.value;
    }

    return `
      <i class='field__grid ${fieldGridCls}'></i>
      <i class='icon icon_good'></i>
      <i class='icon icon_evil'></i>
      <i class='icon icon_lawful'></i>
      <i class='icon icon_chaotic'></i>

      <label class='field__good'>${__("_{Good}", doc)}</label>
      <label class='field__evil'>${__("_{Evil}", doc)}</label>
      <label class='field__lawful'>${__("_{Lawful}", doc)}</label>
      <label class='field__chaotic'>${__("_{Chaotic}", doc)}</label>

      ${radios.join("")}
    `;
  }
}

export let field_control_icon = {
  name: 'control:icon',
  defaults: {
    value: '',
    border: 'none',
    icon: '',
    width: '',
    typeHint: 'string',
  },
  render(args) {
    const cls = elementClass("field", "control", args, [], {"control": ""});
    const iconcls = elementClass("icon", null, { icon: args.icon }, [], {"icon": "", "width": ""});
    return `<div${cls}><i${iconcls}></i></div>`;
  }
}

export let field_control_counter = {
  name: 'control:counter',
  defaults: {
    value: 0,
    max: 3,
    typeHint: 'number',
  },
  render(args, reg, doc) {
    const cls = elementClass("field", "control", { control: "counter" }, [], { control: "input" });
    
    let value = args.value;
    switch (value) {
      case "none": case 0: case false: case "": value = "0"; break;
      default: value = parseInt(value);
    }
    let icon = `icon_counter-${value}`;

    return `<div${cls}>
      <input type='hidden'${fieldIdent(args.id, "rank").ident} class='field--control_counter__number' value='${value}'> `+
      `<i class='icon field--control_counter__icon ${icon}'></i>
    </div>`;
  }
}

export let field_control_proficiency = {
  name: 'control:proficiency',
  defaults: {
    value: 0,
    icon: true,
    'has-bonus': true,
    typeHint: 'number',
  },
  render(args, reg, doc) {
    switch (args.value) {
      case 'untrained': args.value = 0; break;
      case 'trained': args.value = 1; break;
      case 'expert': args.value = 2; break;
      case 'master': args.value = 3; break;
      case 'legendary': args.value = 4; break;
      case 0: case 1: case 2: case 3: case 4: break;
      default: args.value = 0;
    }


    if (args['has-bonus']) {
      args.parts = [
        {
          type: "field",
          control: "proficiency-icon",
          value: args.value,
          id: args.id
        },
        {
          subid: 'bonus',
          control: "input",
          // id: args.id + "-bonus",
          editable: !doc.isLoggedIn,
        }
      ];
    } else {
      args.parts = [
        {
          type: "field",
          control: "proficiency-icon",
          value: args.value,
          id: args.id
        }
      ]
    }

    return renderCompoundControl(args, reg, doc);
  }
}

export let field_control_proficiency_icon = {
  name: 'control:proficiency-icon',
  render(args) {
    const cls = elementClass("field", "control", { control: "icon" }, [], { "control": "input" });

    let value = args.value;
    switch (value) {
      case 'untrained': case 0: case false: value = "untrained"; break;
      case 'trained': case 1: value = "trained"; break;
      case 'expert': case 2: value = "expert"; break;
      case 'master': case 3: value = "master"; break;
      case 'legendary': case 4: value = "legendary"; break;
      default: value = "untrained";
    }
    let icon = `icon_proficiency-${value}`;

    return `<div${cls}>
      <input type='hidden'${fieldIdent(args.id, "rank").ident} class='field--control_proficiency__rank' value='${value}'> `+
      `<i class='icon field--control_proficiency__icon ${icon}'></i>
    </div>`;
  }
}

export let field_control_action_icon = {
  name: 'control:action-icon',
  defaults: {
    value: "template",
    border: "none",
  },
  render(args) {
    const cls = elementClass("field", "control", { control: "icon" }, [], { "control": "input" });

    let icon = 'action-template';
    let layout = 'indent-l';
    switch (args.value) {
      case 1: icon = 'action'; break;
      case 2: icon = 'action2'; break;
      case 3: icon = 'action3'; layout = 'indent-lw'; break;
      case 13: icon = 'action13'; layout = 'indent-lw'; break;
      case '2nd': icon = 'action2nd'; break;
      case '3rd': icon = 'action3rd'; layout = 'indent-lw'; break;
      case 'reaction': icon = 'reaction'; break;
      case 'free': icon = 'free-action'; break;
      case 'template': icon = 'action-template'; layout = 'indent-lw'; break;
    }

    return `<div${cls}>
    <input type='hidden'${fieldIdent(args.id).ident} class='field--control_action-icon__icon' value='${args.value}'> `+
    `<i class='icon field--control_action-icon__icon icon_${icon}'></i>
    </div>`;
  }
}

export let field_control_ref_switch = {
  name: 'control:ref-switch',
  defaults: {
    value: '',
    border: 'bottom',
    typeHint: 'string',
  },
  render(args) {
    let hidden = `<input type='hidden'${fieldIdent(args.id, "ref").ident} class='field--control_ref-switch__ref'>`;
    return hidden + defaultControlRender(args);
  }
}

export let field_control_money = {
  name: 'control:money',
  defaults: {
    indent: 0,
    digits: 3,
    shift: 0,
    decimal: 0,
    denomination: "copper",
    value: '',
    typeHint: 'number',
  },
  render(args, reg, doc) {
    let unit = '';
    switch (args.denomination) {
      case 'platinum': unit = '_{pp}'; break;
      case 'gold': unit = '_{gp}'; break;
      case 'silver': unit = '_{sp}'; break;
      case 'copper': unit = '_{cp}'; break;
    }
    const suffix = `<span class='field__overlay'>${__(unit, doc)}</span>`;

    const ident = fieldIdent(args.id);
    const cls = elementClass("field", "control", args, [], { "digits": 0, "shift": 0, "decimal": 0 });
    const value = (args.value == '') ? '' : ` value='${args.value}'`;

    let ticks = [];
    for (let i = 1; i < args.digits; i++) {
      const decimal = (i == args.decimal) ? ' field__tick--decimal' : '';
      ticks.push(`<label class='field__tick field__tick-${i}${decimal}'></label>`);
    }
    const shift = args.shift > 0 ? `<div class='field__shift field__shift--shift_${args.shift}'></div>` : '';

    return `<div${cls}><input${ident.ident}${value} size='${args.digits}'>${ticks.join("")}</div>${shift}${suffix}`;
  }
}

export let field_control_compound = {
  name: 'control:compound',
  defaults: {
    multibox: false,
    parts: [],
  },
  render: renderCompoundControl
}

export let field_control_ability = {
  name: 'control:ability',
  defaults: {
    parts: [
      // {
      //   subid: "key-ability",
      //   control: "radio"
      // },
      // {
      //   subid: "modifier",
      //   size: "huge",
      //   width: ""
      // },
      // {
      //   subid: "score",
      //   width: ""
      // }
    ]
  },
  render: renderCompoundControl
}

export let field_control_progression = {
  name: 'control:progression',
  defaults: {
    max: 1,
    border: "none",
    typeHint: 'number',
  },
  // transform(args, doc) {
  //   let parts = [];
  //   for (let i = 0; i < args.max; i++) {
  //     parts.push({
  //       control: "control:checkbox",
  //       style: "progress",
  //     });
  //   }
  //   return {
  //     type: "control:compound",
  //     parts: parts,
  //   };
  // },
  render(args, reg, doc) {
    let parts = [];
    for (let i = 0; i < args.max; i++) {
      parts.push({
        control: "checkbox",
        id: args.id+"-"+i,
        style: "progress",
      });
    }
    let compound = {
      parts: parts,
    };
    return renderCompoundControl(compound, reg, doc);
  }
  // render(args, reg, doc) {
  //   args.parts = args.parts.flatMap(part => [part, '<label class="field__separator"></label>']);
  //   args.parts.pop();
  //   return renderCompoundControl(args, reg, doc);
  // }
}
