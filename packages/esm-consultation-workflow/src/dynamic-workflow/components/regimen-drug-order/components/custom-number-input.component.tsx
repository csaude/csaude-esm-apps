import React, { useCallback, ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput, IconButton } from '@carbon/react';
import { Add, Subtract } from '@carbon/react/icons';
import styles from '../regimen-drug-order-step-renderer.scss';

interface CustomNumberInputProps {
  value: number;
  onChange: (value: number) => void;
  labelText: string;
  isTablet: boolean;
  id: string;
}

const CustomNumberInput: React.FC<CustomNumberInputProps> = ({
  value,
  onChange,
  labelText,
  isTablet,
  ...inputProps
}) => {
  const { t } = useTranslation();
  const responsiveSize = isTablet ? 'lg' : 'sm';

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/[^\d]/g, '').slice(0, 2);
      onChange(val ? parseInt(val) : 0);
    },
    [onChange],
  );

  const increment = () => {
    onChange(Number(value) + 1);
  };

  const decrement = () => {
    onChange(Math.max(Number(value) - 1, 0));
  };

  return (
    <div className={styles.customElement}>
      <span className="cds--label">{labelText}</span>
      <div className={styles.customNumberInput}>
        <IconButton onClick={decrement} label={t('decrement', 'Decrement')} size={responsiveSize}>
          <Subtract size={16} />
        </IconButton>
        <TextInput
          onChange={handleChange}
          className={styles.customInput}
          value={!!value ? value : '--'}
          size={responsiveSize}
          {...inputProps}
        />
        <IconButton onClick={increment} label={t('increment', 'Increment')} size={responsiveSize}>
          <Add size={16} />
        </IconButton>
      </div>
    </div>
  );
};

export default CustomNumberInput;
