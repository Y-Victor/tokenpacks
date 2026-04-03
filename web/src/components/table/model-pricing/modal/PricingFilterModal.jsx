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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../ui/dialog';
import { resetPricingFilters } from '../../../../helpers/utils';
import FilterModalContent from './components/FilterModalContent';
import FilterModalFooter from './components/FilterModalFooter';

const PricingFilterModal = ({ visible, onClose, sidebarProps, t }) => {
  const handleResetFilters = () =>
    resetPricingFilters({
      handleChange: sidebarProps.handleChange,
      setShowWithRecharge: sidebarProps.setShowWithRecharge,
      setCurrency: sidebarProps.setCurrency,
      setShowRatio: sidebarProps.setShowRatio,
      setViewMode: sidebarProps.setViewMode,
      setFilterGroup: sidebarProps.setFilterGroup,
      setFilterQuotaType: sidebarProps.setFilterQuotaType,
      setFilterEndpointType: sidebarProps.setFilterEndpointType,
      setFilterVendor: sidebarProps.setFilterVendor,
      setFilterTag: sidebarProps.setFilterTag,
      setCurrentPage: sidebarProps.setCurrentPage,
      setTokenUnit: sidebarProps.setTokenUnit,
    });

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className='w-full h-full max-w-full max-h-full m-0 rounded-none sm:rounded-lg sm:w-[90%] sm:h-auto sm:max-h-[90vh]'
      >
        <DialogHeader>
          <DialogTitle>{t('筛选')}</DialogTitle>
        </DialogHeader>
        <div
          className='overflow-y-auto'
          style={{
            height: 'calc(100vh - 160px)',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <FilterModalContent sidebarProps={sidebarProps} t={t} />
        </div>
        <DialogFooter>
          <FilterModalFooter onReset={handleResetFilters} onConfirm={onClose} t={t} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PricingFilterModal;
