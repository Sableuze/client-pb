import React, { useState } from 'react';
import { IMaskInput } from 'react-imask';

import {
  Box,
  Button,
  Container,
  FormControlLabel,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from '@mui/material';

import { ITransport } from '@app/models';
import { useStore } from '@app/store.tsx';
import { v4Int } from '@app/utils';

export type TransportAddState = Pick<
  ITransport,
  'typeId' | 'regNumber' | 'name' | 'createdAt' | 'avgConsumption' | 'id' | 'unit'
>;

type TransportAddFormProps = {
  onApply: (state: TransportAddState) => void;
};

type ViewType = {
  id: string;
  title: string;
};

interface MaskedInputProps {
  mask: string;
  name?: string;
  onChange: (value: string) => void;
}

// @TODO возможно вынести позже
const MaskedInput = React.forwardRef<HTMLElement, MaskedInputProps>((props, ref) => {
  const { mask, onChange, ...other } = props;

  const setRef = (imaskInput: { el: HTMLElement } | null) => {
    if (imaskInput && ref) {
      // Ensure the ref is associated directly with the native input element
      (ref as React.RefCallback<HTMLElement>)(imaskInput.el);
    }
  };

  return (
    <IMaskInput
      mask={mask}
      onAccept={(_, mask) => onChange(mask.unmaskedValue)}
      overwrite
      {...other}
      ref={setRef} // Pass ref to IMaskInput
    />
  );
});
const VehicleForm: React.FC<TransportAddFormProps> = ({ onApply }) => {
  const store = useStore();

  const vehicleTypes = Object.keys(store.appStore.transportTypes).map((id) => {
    return { id, title: store.appStore.transportTypes[id] };
  });

  const [hasRegError, setHasRegError] = useState(false);
  const [type, setType] = useState<ViewType>(vehicleTypes[0]);
  const [regNumber, setRegNumber] = useState<TransportAddState['regNumber']>('');
  const [name, setName] = useState<TransportAddState['name']>('');
  const [consumption, setConsumption] = useState<string>();
  const [unit, setUnit] = useState<TransportAddState['unit']>('L');

  const onChangeUnit = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.target.checked ? setUnit('Kv') : setUnit('L');
  };

  const validateRegNumber = () => {
    if (regNumber?.length && regNumber.length >= 7) {
      setHasRegError(false);
    } else {
      setHasRegError(true);
    }
  };

  const onSetTransportType = (value: ViewType['id']) => {
    const vehicleType = vehicleTypes.find((i) => i.id === value);
    vehicleType && setType(vehicleType);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (hasRegError) return;
    onApply({
      typeId: parseInt(type.id),
      regNumber,
      name,
      unit,
      avgConsumption: parseFloat(consumption || '0'),
      createdAt: new Date(),
      id: v4Int(),
    });
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h5" style={{ margin: '24px 0' }}>
        Новое транспортное средство
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          select
          label="Транспортное средство *"
          name="type"
          value={type.id}
          onChange={({ target }) => onSetTransportType(target.value)}
          required
          fullWidth
          margin="normal"
          variant="outlined">
          {vehicleTypes.map((option) => (
            <MenuItem key={option.id} value={option.id}>
              {option.title}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Гос. номер"
          value={regNumber}
          required
          fullWidth
          error={hasRegError}
          helperText={hasRegError && 'Минимум 7 знаков'}
          onChange={(value: unknown) => setRegNumber(value as string)}
          onBlur={validateRegNumber}
          InputProps={{
            /* @ts-expect-error: input component error */
            inputComponent: MaskedInput,
            inputProps: {
              mask: '{A} 000 {AA} 00[0]', // '000' для цифр, 'AA' для букв, '[0]' для необязательной цифры'
              definitions: {
                // Указываем валидные значения для 'A' - это может быть любая из перечисленных букв
                A: /[АВЕКМНОРСТУХ]/i,
              },
              prepare: (str: string) => str.toUpperCase(), // Все буквы в верхнем регистреsk for date
            },
          }}
        />
        <TextField
          label="Название"
          name="name" // This must match the state object's property name
          value={name}
          onChange={({ target }) => setName(target.value)}
          required
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <Box display="flex" justifyContent="space-between">
          <TextField
            label="Расход на 100 км"
            name="consumption" // This must match the state object's property name
            value={consumption}
            onChange={({ target }) => setConsumption(target.value)}
            required
            type={'number'}
            margin="normal"
            variant="outlined"
          />{' '}
          <FormControlLabel
            control={<Switch onChange={onChangeUnit} />}
            className={'bold'}
            label="У меня электрокар"
          />
        </Box>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          style={{ marginTop: '16px' }}>
          Добавить
        </Button>
      </form>
    </Container>
  );
};

export default VehicleForm;
