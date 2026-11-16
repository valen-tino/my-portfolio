import React, { useEffect, useMemo, useState } from 'react';
import CMSLayout from '../components/CMSLayout';
import { CMSStorage, type CMSWorkProcessStep } from '../apiStorage';
import {
  CMSStatusBanner,
  CMSFieldError,
  getCMSInputErrorClasses,
  type CMSMessage,
} from '../components/CMSStatusBanner';
import { parseCMSError } from '../utils/errorUtils';

interface WorkProcessFormState {
  title: string;
  description: string;
  order: number;
  isPublished: boolean;
}

const WorkProcessManagement: React.FC = () => {
  const [steps, setSteps] = useState<CMSWorkProcessStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingStep, setEditingStep] = useState<CMSWorkProcessStep | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formState, setFormState] = useState<WorkProcessFormState>({
    title: '',
    description: '',
    order: 1,
    isPublished: true,
  });
  const [message, setMessage] = useState<CMSMessage>({ type: '', text: '' });
  const [loadFailed, setLoadFailed] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const sortedSteps = useMemo(
    () =>
      [...steps].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [steps]
  );

  const loadSteps = async () => {
    try {
      setLoading(true);
      setLoadFailed(false);
      const data = await CMSStorage.getWorkProcesses();
      setSteps(data);
    } catch (error) {
      console.error('Error loading work process steps:', error);
      const parsed = parseCMSError(error, 'Failed to load work process steps.');
      setLoadFailed(true);
      setMessage({
        type: 'error',
        text: parsed.message,
        details: parsed.details,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSteps();
  }, []);

  const resetForm = () => {
    setEditingStep(null);
    setIsAddingNew(false);
    setFieldErrors({});
    setFormState({
      title: '',
      description: '',
      order: sortedSteps.length + 1,
      isPublished: true,
    });
  };

  const handleStartAdd = () => {
    setIsAddingNew(true);
    setEditingStep(null);
    setFieldErrors({});
    setMessage({ type: '', text: '' });
    setFormState({
      title: '',
      description: '',
      order: sortedSteps.length + 1,
      isPublished: true,
    });
  };

  const handleStartEdit = (step: CMSWorkProcessStep) => {
    setIsAddingNew(false);
    setEditingStep(step);
    setFieldErrors({});
    setMessage({ type: '', text: '' });
    setFormState({
      title: step.title,
      description: step.description,
      order: step.order ?? 0,
      isPublished: step.isPublished !== false,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextFieldErrors: Record<string, string> = {};
    if (!formState.title.trim()) {
      nextFieldErrors.title = 'Step title is required.';
    }
    if (!formState.description.trim()) {
      nextFieldErrors.description = 'Step description is required.';
    }
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setMessage({
        type: 'error',
        text: 'Step title and description are required.',
      });
      return;
    }

    setSaving(true);
    setFieldErrors({});
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        title: formState.title.trim(),
        description: formState.description.trim(),
        order: Number.isFinite(Number(formState.order)) ? Number(formState.order) : 0,
        isPublished: formState.isPublished,
      };

      if (editingStep) {
        const targetId = String(editingStep._id || editingStep.id);
        await CMSStorage.updateWorkProcess(targetId, payload);
        setMessage({
          type: 'success',
          text: 'Work process step updated successfully!',
        });
      } else {
        await CMSStorage.addWorkProcess(payload);
        setMessage({
          type: 'success',
          text: 'Work process step created successfully!',
        });
      }

      resetForm();
      await loadSteps();
    } catch (error: any) {
      console.error('Save work process error:', error);
      const parsed = parseCMSError(error, 'Failed to save work process step.');
      if (Object.keys(parsed.fieldErrors).length > 0) {
        setFieldErrors((prev) => ({ ...prev, ...parsed.fieldErrors }));
      }
      setMessage({
        type: 'error',
        text: parsed.message,
        details: parsed.details,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (step: CMSWorkProcessStep) => {
    if (!window.confirm(`Delete "${step.title}" from your work process?`)) {
      return;
    }

    try {
      const targetId = String(step._id || step.id);
      await CMSStorage.deleteWorkProcess(targetId);
      setMessage({
        type: 'success',
        text: `"${step.title}" deleted successfully.`,
      });
      await loadSteps();
    } catch (error: any) {
      console.error('Delete work process error:', error);
      const parsed = parseCMSError(error, 'Failed to delete work process step.');
      setMessage({
        type: 'error',
        text: parsed.message,
        details: parsed.details,
      });
    }
  };

  const handleTogglePublished = async (step: CMSWorkProcessStep) => {
    try {
      const targetId = String(step._id || step.id);
      await CMSStorage.updateWorkProcess(targetId, {
        isPublished: step.isPublished === false,
      });
      await loadSteps();
    } catch (error) {
      console.error('Toggle publish error:', error);
      const parsed = parseCMSError(error, 'Failed to update step visibility.');
      setMessage({
        type: 'error',
        text: parsed.message,
        details: parsed.details,
      });
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= sortedSteps.length) return;

    const current = sortedSteps[index];
    const target = sortedSteps[swapIndex];
    const currentOrder = current.order ?? index + 1;
    const targetOrder = target.order ?? swapIndex + 1;
    const resolvedCurrentOrder = currentOrder === targetOrder ? swapIndex + 1 : targetOrder;
    const resolvedTargetOrder = currentOrder === targetOrder ? index + 1 : currentOrder;

    try {
      await Promise.all([
        CMSStorage.updateWorkProcess(String(current._id || current.id), {
          order: resolvedCurrentOrder,
        }),
        CMSStorage.updateWorkProcess(String(target._id || target.id), {
          order: resolvedTargetOrder,
        }),
      ]);
      await loadSteps();
    } catch (error) {
      console.error('Reorder work process error:', error);
      const parsed = parseCMSError(error, 'Failed to reorder work process steps.');
      setMessage({
        type: 'error',
        text: parsed.message,
        details: parsed.details,
      });
    }
  };

  const handleSeedDefaults = async () => {
    try {
      setSaving(true);
      await CMSStorage.seedWorkProcesses();
      setMessage({
        type: 'success',
        text: 'Default 6 work process steps imported successfully!',
      });
      await loadSteps();
    } catch (error: any) {
      console.error('Seed work processes error:', error);
      const parsed = parseCMSError(error, 'Failed to import default process steps.');
      setMessage({
        type: 'error',
        text: parsed.message,
        details: parsed.details,
      });
    } finally {
      setSaving(false);
    }
  };

  const isFormOpen = isAddingNew || editingStep !== null;

  return (
    <CMSLayout>
      <div className="container mx-auto max-w-6xl p-4 space-y-6 text-gray-900">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Work Process Management</h1>
            <p className="text-gray-600 mt-2">
              Manage the design and engineering methodology steps displayed in the Process section.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {sortedSteps.length === 0 && !loading && (
              <button
                type="button"
                onClick={handleSeedDefaults}
                disabled={saving}
                className="btn bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
              >
                Import Default 6 Steps
              </button>
            )}
            <button
              type="button"
              onClick={handleStartAdd}
              disabled={isFormOpen}
              className="btn btn-primary text-white"
            >
              + Add New Step
            </button>
          </div>
        </div>

        {/* Status Message when form is closed */}
        {!isFormOpen && (
          <CMSStatusBanner
            message={message}
            onDismiss={() => {
              setMessage({ type: '', text: '' });
              setLoadFailed(false);
            }}
            onRetry={loadFailed ? loadSteps : undefined}
          />
        )}

        {/* Create / Edit Form */}
        {isFormOpen && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {editingStep ? `Edit Step: ${editingStep.title}` : 'Add New Process Step'}
            </h2>
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-2">
                  <label htmlFor="process-title" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Step Title *
                  </label>
                  <input
                    id="process-title"
                    type="text"
                    required
                    aria-invalid={Boolean(fieldErrors.title)}
                    value={formState.title}
                    onChange={(e) => {
                      clearFieldError('title');
                      setFormState((prev) => ({ ...prev, title: e.target.value }));
                    }}
                    placeholder="e.g., Development"
                    className={`w-full px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400 border rounded-lg focus:outline-none focus:ring-2 ${getCMSInputErrorClasses(Boolean(fieldErrors.title))}`}
                  />
                  <CMSFieldError error={fieldErrors.title} />
                </div>
                <div>
                  <label htmlFor="process-order" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Order
                  </label>
                  <input
                    id="process-order"
                    type="number"
                    min={0}
                    value={formState.order}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        order: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="process-description" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description *
                </label>
                <textarea
                  id="process-description"
                  rows={4}
                  required
                  aria-invalid={Boolean(fieldErrors.description)}
                  value={formState.description}
                  onChange={(e) => {
                    clearFieldError('description');
                    setFormState((prev) => ({ ...prev, description: e.target.value }));
                  }}
                  placeholder="Describe this stage of your workflow..."
                  className={`w-full px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400 border rounded-lg focus:outline-none focus:ring-2 ${getCMSInputErrorClasses(Boolean(fieldErrors.description))}`}
                />
                <CMSFieldError error={fieldErrors.description} />
              </div>

              <CMSStatusBanner
                message={message}
                onDismiss={() => setMessage({ type: '', text: '' })}
              />

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.isPublished}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, isPublished: e.target.checked }))
                    }
                    className="toggle toggle-success"
                  />
                  <span className="text-sm font-medium text-gray-700">Published on Home page</span>
                </label>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={saving}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn btn-primary text-white"
                  >
                    {saving ? 'Saving...' : editingStep ? 'Update Step' : 'Create Step'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Steps List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Process Steps ({sortedSteps.length})
          </h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : sortedSteps.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <p className="text-gray-600">
                No process steps saved in the database yet. Import the default 6 steps or create a new step above.
              </p>
              <button
                type="button"
                onClick={handleSeedDefaults}
                disabled={saving}
                className="btn btn-outline btn-primary"
              >
                Import Default 6 Steps
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedSteps.map((step, index) => (
                <div
                  key={String(step._id || step.id || `${step.title}-${index}`)}
                  className="rounded-lg border border-gray-200 bg-gray-50/70 p-5 hover:border-gray-300 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            step.isPublished !== false
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-gray-100 text-gray-700 border-gray-300'
                          }`}
                        >
                          {step.isPublished !== false ? 'Published' : 'Hidden'}
                        </span>
                        <span className="text-xs text-gray-500">Order: {step.order ?? 0}</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{step.description}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        aria-label={`Move ${step.title} up`}
                        disabled={index === 0}
                        onClick={() => handleMove(index, 'up')}
                        className="px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-40"
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        aria-label={`Move ${step.title} down`}
                        disabled={index === sortedSteps.length - 1}
                        onClick={() => handleMove(index, 'down')}
                        className="px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-40"
                      >
                        Down
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTogglePublished(step)}
                        className="px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100"
                      >
                        {step.isPublished !== false ? 'Hide' : 'Publish'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(step)}
                        className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-white border border-blue-200 rounded-md hover:bg-blue-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(step)}
                        className="px-3 py-1.5 text-xs font-medium text-red-700 bg-white border border-red-200 rounded-md hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </CMSLayout>
  );
};

export default WorkProcessManagement;

