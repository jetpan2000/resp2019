import React from 'react';
import { find } from 'lodash';

export function getChildOfComponentType(children, componentName) {
    return find(React.Children.toArray(children), x => x && x.type && x.type.name === componentName);
}