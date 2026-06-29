import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Stack,
} from '@mui/material';

// 表单数据类型
export interface UserFormData {
  name: string;
  email: string;
  age?: number;
}

// Zod 验证 schema
const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  age: z.number().min(0).max(120).optional(),
});

export interface UserFormProps {
  defaultValues?: Partial<UserFormData>;
  onSubmit: (data: UserFormData) => void;
  loading?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
  defaultValues,
  onSubmit,
  loading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues,
  });

  return (
    <Paper sx={{ p: 3, maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        User Form
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <TextField
            label="Name"
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
            disabled={loading}
          />

          <TextField
            label="Email"
            type="email"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
            disabled={loading}
          />

          <TextField
            label="Age"
            type="number"
            {...register('age', { valueAsNumber: true })}
            error={!!errors.age}
            helperText={errors.age?.message}
            disabled={loading}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Submit'}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
};

export default UserForm;
export { UserForm };