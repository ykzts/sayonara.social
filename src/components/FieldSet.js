import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from 'styled-components';

const FieldSetRoot = styled.fieldset`
  border: 0;
  margin: 0;
  padding: 0;
`;

const Legend = styled.legend`
  margin: 0;
  padding: 0;
`;

const Label = styled.label`
  margin: 0;
  padding: 0;
`;

export default class FieldSet extends Component {
  static defaultProps = {
    children: [],
    htmlFor: null,
    label: null,
  };

  static displayName = 'FieldSet';

  static propTypes = {
    children: PropTypes.arrayOf(PropTypes.element),
    label: PropTypes.string,
    htmlFor: PropTypes.string,
  };

  render() {
    const { htmlFor, label } = this.props;
    return (
      <FieldSetRoot>
        {label && (
          <Legend>
            <Label htmlFor={htmlFor || false}>{label}</Label>
          </Legend>
        )}
        {this.props.children}
      </FieldSetRoot>
    );
  }
}
