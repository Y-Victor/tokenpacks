/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React from 'react';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export default function HttpStatusCodeRulesInput(props) {
  const {
    label,
    field,
    placeholder,
    extraText,
    onChange,
    parsed,
    invalidText,
  } = props;

  return (
    <>
      <div className="space-y-2">
        {label && <Label>{label}</Label>}
        <Input
          placeholder={placeholder}
          name={field}
          onChange={(e) => onChange(e.target.value)}
        />
        {extraText && (
          <div className="text-sm text-muted-foreground">{extraText}</div>
        )}
      </div>
      {parsed?.ok && parsed.tokens?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {parsed.tokens.map((token) => (
            <Badge key={token} variant="secondary">
              {token}
            </Badge>
          ))}
        </div>
      )}
      {!parsed?.ok && (
        <p className="text-sm text-destructive mt-2">
          {invalidText}
          {parsed?.invalidTokens && parsed.invalidTokens.length > 0
            ? `: ${parsed.invalidTokens.join(', ')}`
            : ''}
        </p>
      )}
    </>
  );
}
