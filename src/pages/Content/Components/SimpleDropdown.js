// because none of the dropdown npm packages were working with the shadow dom =(

import React from 'react';
import Icon from '@mdi/react';
import { mdiChevronDown } from '@mdi/js';
import useOnClickOutside from '../Hooks/useOnClickOutside';

import { useState, useEffect, useRef } from 'react';

export default function SimpleDropdown({
  options,
  value,
  onChange,
  placeholder,
}) {
  const [isOpen, setOpen] = useState(false);
  const ref = useRef();
  useOnClickOutside(ref, () => setOpen(false)); //currently unused! (no refs below)

  const toggleDropdown = () => setOpen((prev) => !prev);

  const handleSelectionClick = (value) => {
    setOpen(false);
    onChange(value);
  };


  // handle simple list
  function renderItems(value, options) {
    return options.map((item, i) => {

      return (
        <div
          key={`${i + item.value}`}
          className="dropdown-item"
          onClick={(e) => {
            handleSelectionClick(item.value);
          }}
          value={item.value}
        >
          <span
            className={`dropdown-item-dot ${
              item.value === value && 'selected'
            }`}
          >
            •{' '}
          </span>
          {item.label}
        </div>
      );
    });
  }

  function renderGrouped(value, options) {
  

    return (
      <>
        {options.map((group, i) => {
          return (
            <div key={group.name + i}>
              {group.items.length ? (
                <>
                  <span className="control-group-heading">{group.name}</span>
                  {renderItems(value, group.items)}
                </>
              ) : null}
            </div>
          );
        })}
      </>
    );
  }

  function getLabel(value, options) {
    let label;

    if (options[0].type !== 'group') {
      label = options.filter((item) => item.value === value)[0]?.label;
    } else {
      let red = options
        .map((g) => g.items)
        .reduce((acc, curr) => {
          return [...curr, ...acc];
        }, [])
        .filter((item) => item.value === value)[0]?.label;
      return red;
    }
    return label || false;
  }

  function render(value, options) {
    return (
      <div className={`simple-dropdown dropdown ${isOpen && 'open'}`}>
        <div className="dropdown-header" onClick={toggleDropdown}>
          <span>
            {getLabel(value, options) ||
              placeholder ||
              'Please select an option:'}
          </span>
          <Icon
            className={`chev ${isOpen ? 'open' : 'closed'}`}
            path={mdiChevronDown}
            size={1.1}
        
            color="rgba(0,0,0,0.6)"
          />
        </div>
        <div className={`dropdown-body ${isOpen && 'open'}`}>
          {options[0].type === 'group'
            ? renderGrouped(value, options)
            : renderItems(value, options)}
        </div>
      </div>
    );
  }

  return <>{render(value, options)}</>;
  //NOTE: CLICKOUTSIDE doesn't work (like with react-select and other libs - probably some rerendering issue?)
  // return <div ref={ref}>{render(value, options)}</div>;
}

