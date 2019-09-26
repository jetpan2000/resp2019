import React from 'react';
import { Panel } from 'react-bootstrap';
import { assign } from 'lodash';

// TODO - Redesign the styling of these components. They are still based on what is currently in Odiss which is really hacky.

const DocumentTab = ({ title, children, style, ...props }) => {
    style = style || {};
    assign(style, {
        marginBottom: 'inherit',
        backgroundColor: 'inherit',
        border: 'inherit',
        borderRadius: 'inherit',
        boxShadow: 'inherit'
    });

    return <Panel style={style} {...props}>
        <ul className="nav nav-sidebar">
            <li>
                <Panel.Toggle>{title}</Panel.Toggle>
            </li>
        </ul>
        <Panel.Collapse className="panel-in">
            <div style={{ padding: '10px' }}>
                {children}
            </div>
        </Panel.Collapse>
    </Panel>
};

const DocumentTabSection = ({ title, children }) => (
    <React.Fragment>
        <div style={{display:'block', position: 'relative', padding: '7px 18px 8px 18px', fontWeight: 'bold', backgroundColor: '#f3f3f3'}}>
            {title}
        </div>
        {children}
    </React.Fragment>
);

DocumentTab.Section = DocumentTabSection;

export default DocumentTab;