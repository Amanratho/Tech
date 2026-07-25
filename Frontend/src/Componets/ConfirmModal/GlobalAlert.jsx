import React, { useState, useEffect } from 'react';
import ConfirmModal from './ConfirmModal';
import { useTranslation } from 'react-i18next';

const GlobalAlert = () => {
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    message: '',
    variant: 'success',
  });
  const { t } = useTranslation();

  useEffect(() => {
    const handleAlert = (event) => {
      setAlertConfig({
        isOpen: true,
        message: event.detail.message,
        variant: event.detail.type,
      });
    };

    window.addEventListener('rv-alert', handleAlert);
    return () => window.removeEventListener('rv-alert', handleAlert);
  }, []);

  const handleClose = () => {
    setAlertConfig(prev => ({ ...prev, isOpen: false }));
  };

  const getTitle = () => {
    switch(alertConfig.variant) {
      case 'success': return t('success') || 'Success';
      case 'danger': return t('error') || 'Error';
      case 'warning': return t('warning') || 'Warning';
      default: return t('info') || 'Information';
    }
  };

  return (
    <ConfirmModal
      isOpen={alertConfig.isOpen}
      isAlert={true}
      title={getTitle()}
      message={alertConfig.message}
      variant={alertConfig.variant}
      onConfirm={handleClose}
      onCancel={handleClose}
    />
  );
};

export default GlobalAlert;
