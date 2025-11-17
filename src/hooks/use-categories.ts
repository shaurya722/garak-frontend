import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService, CategoryResponse, Category } from '@/services/category/category.service';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export const useCategories = (params?: { page?: number; limit?: number }) => {
  const { page = 1, limit = 10 } = params || {};

  return useQuery<CategoryResponse>({
    queryKey: ['categories', page, limit],
    queryFn: () => categoryService.getCategories({ page, limit }),
    staleTime: 1000 * 60, // 10 seconds - data stays fresh for 10s
  });
};

export const useCategory = (id: string) => {
  return useQuery<Category>({
    queryKey: ['category', id],
    queryFn: () => categoryService.getCategory(id),
    enabled: !!id,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: Parameters<typeof categoryService.createCategory>[0]) =>
      categoryService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'], exact: false });
      toast.success('Category created successfully');
      router.push('/policies/new');
    },
    onError: (error) => {
      console.error('Category creation failed:', error);
      toast.error('Failed to create category');
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Parameters<typeof categoryService.updateCategory>[1]) =>
      categoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'], exact: false });
      toast.success('Category updated successfully');
      router.push('/policies/new');
    },
    onError: (error) => {
      console.error('Category update failed:', error);
      toast.error('Failed to update category');
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'], exact: false });
      toast.success('Category deleted successfully');
    },
  });
};
