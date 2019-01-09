import React from 'react';
import { Panel } from 'react-bootstrap';
import { assign } from 'lodash';
//import styled from 'styled-components';

//const UL = styled.ul`
//    margin-right: -21px;
//    margin-bottom: 1px;
//    margin-left: -20px;
//`;

//const TabToggle = styled(Panel.Toggle)`
//    padding: 7px 18px 8px 18px;
//    color: #fff;
//    background-color: #5f4e48;
//    font-weight: bold;
//`;

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

export default DocumentTab;