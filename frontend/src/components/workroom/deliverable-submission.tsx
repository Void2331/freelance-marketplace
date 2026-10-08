import {
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileType,
  Paperclip,
  RotateCcw,
  Upload,
  X,
} from "lucide-react";

import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

import {
  useMilestoneSubmissions,
  useSubmitMilestone,
  useUploadMilestoneDeliverables,
} from "@/hooks/use-milestones";

import type { MilestoneSubmission } from "@/types/milestoneSubmission";

/* -------------------------------------------------------------------------- */
/*                                CONSTANTS                                   */
/* -------------------------------------------------------------------------- */

const MAX_FILES = 10;

const MAX_FILE_SIZE = 25 * 1024 * 1024;

const ACCEPTED_TYPES = [
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  // Archives
  "application/zip",
  "application/x-zip-compressed",

  // Spreadsheets
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

  // Presentations
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",

  // Text
  "text/plain",
  "text/csv",

  // Images
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

/* -------------------------------------------------------------------------- */
/*                              HELPER FUNCTIONS                              */
/* -------------------------------------------------------------------------- */

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatSize(bytes?: number): string {
  if (!bytes) {
    return "";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(file: File) {
  if (file.type.startsWith("image/")) {
    return FileImage;
  }

  if (file.type.includes("zip")) {
    return FileArchive;
  }

  if (
    file.type.includes("spreadsheet") ||
    file.type.includes("excel")
  ) {
    return FileSpreadsheet;
  }

  if (
    file.type.includes("pdf") ||
    file.type.includes("word") ||
    file.type.includes("text")
  ) {
    return FileText;
  }

  return FileType;
}

function formatSubmissionDate(date?: string): string {
  if (!date) {
    return "";
  }

  return new Date(date).toLocaleString();
}

function getStatusLabel(
  status: MilestoneSubmission["status"],
): string {
  switch (status) {
    case "APPROVED":
      return "Approved";

    case "REVISION_REQUESTED":
      return "Changes requested";

    case "DISPUTED":
      return "Disputed";

    default:
      return "Pending review";
  }
}

function getStatusIcon(
  status: MilestoneSubmission["status"],
) {
  switch (status) {
    case "APPROVED":
      return CheckCircle2;

    case "REVISION_REQUESTED":
      return RotateCcw;

    default:
      return Clock3;
  }
}

/* -------------------------------------------------------------------------- */
/*                         DELIVERABLE SUBMISSION                             */
/* -------------------------------------------------------------------------- */

interface DeliverableSubmissionProps {
  milestoneId: string;
  projectId: string;
  onSubmitted?: () => void;
}

export function DeliverableSubmission({
  milestoneId,
  projectId,
  onSubmitted,
}: DeliverableSubmissionProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadMutation = useUploadMilestoneDeliverables();

  const submitMutation = useSubmitMilestone();

  /* ------------------------------------------------------------------------ */
  /*                               FILE HANDLING                              */
  /* ------------------------------------------------------------------------ */

  const addFiles = (incomingFiles: File[]) => {
    const validFiles: File[] = [];

    for (const file of incomingFiles) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        continue;
      }

      validFiles.push(file);
    }

    setFiles((currentFiles) => {
      const combined = [...currentFiles, ...validFiles];

      const uniqueFiles = combined.filter(
        (file, index, array) =>
          array.findIndex(
            (item) =>
              item.name === file.name &&
              item.size === file.size &&
              item.lastModified === file.lastModified,
          ) === index,
      );

      return uniqueFiles.slice(0, MAX_FILES);
    });
  };

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFiles = Array.from(
      event.target.files ?? [],
    );

    addFiles(selectedFiles);

    // Allows selecting the same file again after removing it.
    event.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((currentFiles) =>
      currentFiles.filter(
        (_, fileIndex) => fileIndex !== index,
      ),
    );
  };

  const handleDrop = (
    event: DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();

    setDragActive(false);

    if (isSubmitting) {
      return;
    }

    const droppedFiles = Array.from(
      event.dataTransfer.files,
    );

    addFiles(droppedFiles);
  };

  /* ------------------------------------------------------------------------ */
  /*                              SUBMIT HANDLER                              */
  /* ------------------------------------------------------------------------ */

  const handleSubmit = async () => {
    if (!files.length || isSubmitting) {
      return;
    }

    try {
      setUploadProgress(0);

      /*
       * Step 1:
       * Upload the selected files.
       *
       * The upload hook currently requires:
       * milestoneId
       * projectId
       * message
       * files
       */
      await uploadMutation.mutateAsync({
        milestoneId,
        projectId,
        message: message.trim(),
        files,
      });

      setUploadProgress(100);

      /*
       * Step 2:
       * Create the milestone submission.
       *
       * The current useSubmitMilestone hook expects
       * File[] rather than DeliverableAttachment[].
       *
       * Therefore we pass the original files instead of
       * the result returned by the upload mutation.
       */
      await submitMutation.mutateAsync({
        milestoneId,
        projectId,
        message: message.trim(),
        files,
      });

      /*
       * Step 3:
       * Reset the form after successful submission.
       */
      setFiles([]);
      setMessage("");
      setUploadProgress(0);

      onSubmitted?.();
    } catch (error) {
      console.error(
        "Milestone submission failed:",
        error,
      );

      setUploadProgress(0);
    }
  };

  const isSubmitting =
    uploadMutation.isPending ||
    submitMutation.isPending;

  /* ------------------------------------------------------------------------ */
  /*                                  RENDER                                  */
  /* ------------------------------------------------------------------------ */

  return (
    <Card className="border-zinc-200 shadow-sm">
      <CardContent className="space-y-5 p-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold text-zinc-950">
            Upload finished work
          </h3>

          <p className="mt-1 text-sm text-zinc-500">
            Upload your completed milestone files and
            send them to the client for review.
          </p>
        </div>

        {/* Upload Area */}
        <div
          onDragEnter={(event) => {
            event.preventDefault();

            if (!isSubmitting) {
              setDragActive(true);
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();

            if (!isSubmitting) {
              setDragActive(true);
            }
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setDragActive(false);
          }}
          onDrop={handleDrop}
          onClick={() => {
            if (!isSubmitting) {
              inputRef.current?.click();
            }
          }}
          className={[
            "cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition",
            dragActive
              ? "border-zinc-900 bg-zinc-50"
              : "border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50",
            isSubmitting
              ? "cursor-not-allowed opacity-60"
              : "",
          ].join(" ")}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            hidden
            disabled={isSubmitting}
            accept={ACCEPTED_TYPES.join(",")}
            onChange={handleFileChange}
          />

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
            <Upload className="h-5 w-5 text-zinc-700" />
          </div>

          <p className="mt-4 font-medium text-zinc-900">
            Drop your files here
          </p>

          <p className="mt-1 text-sm text-zinc-500">
            or click to browse
          </p>

          <p className="mt-3 text-xs text-zinc-400">
            Up to {MAX_FILES} files • 25MB per file
          </p>

          <p className="mt-1 text-xs text-zinc-400">
            PDF, ZIP, Word, Excel, PowerPoint,
            images and text files
          </p>
        </div>

        {/* Selected Files */}
        {files.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-900">
                Files selected
              </p>

              <span className="text-xs text-zinc-500">
                {files.length}/{MAX_FILES}
              </span>
            </div>

            {files.map((file, index) => {
              const Icon = getFileIcon(file);

              return (
                <div
                  key={`${file.name}-${file.lastModified}`}
                  className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                    <Icon className="h-4 w-4 text-zinc-700" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-900">
                      {file.name}
                    </p>

                    <p className="text-xs text-zinc-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={(event) => {
                      event.stopPropagation();
                      removeFile(index);
                    }}
                    className="rounded-md p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Delivery Message */}
        <div className="space-y-2">
          <label
            htmlFor={`delivery-message-${milestoneId}`}
            className="text-sm font-medium text-zinc-900"
          >
            Delivery message
          </label>

          <Textarea
            id={`delivery-message-${milestoneId}`}
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            placeholder="Tell the client what you completed, what files are included, and anything they should review..."
            rows={5}
            disabled={isSubmitting}
          />
        </div>

        {/* Upload Progress */}
        {uploadMutation.isPending && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">
                Uploading files...
              </span>

              <span className="font-medium text-zinc-900">
                {uploadProgress}%
              </span>
            </div>

            <Progress value={uploadProgress} />
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="button"
          className="w-full"
          disabled={
            !files.length ||
            isSubmitting ||
            !message.trim()
          }
          onClick={handleSubmit}
        >
          <Paperclip className="mr-2 h-4 w-4" />

          {uploadMutation.isPending
            ? "Uploading..."
            : submitMutation.isPending
              ? "Submitting..."
              : "Submit milestone for review"}
        </Button>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*                           SUBMISSION HISTORY                               */
/* -------------------------------------------------------------------------- */

interface SubmissionHistoryProps {
  milestoneId: string;
}

export function SubmissionHistory({
  milestoneId,
}: SubmissionHistoryProps) {
  const {
    data: submissions = [],
    isLoading,
  } = useMilestoneSubmissions(milestoneId);

  /* ------------------------------------------------------------------------ */
  /*                                LOADING                                   */
  /* ------------------------------------------------------------------------ */

  if (isLoading) {
    return (
      <div className="rounded-xl border border-zinc-200 p-5">
        <p className="text-sm text-zinc-500">
          Loading submission history...
        </p>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /*                                  EMPTY                                   */
  /* ------------------------------------------------------------------------ */

  if (!submissions.length) {
    return null;
  }

  /* ------------------------------------------------------------------------ */
  /*                                  RENDER                                  */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-zinc-950">
          Submission history
        </h3>

        <p className="text-sm text-zinc-500">
          All versions submitted for this milestone.
        </p>
      </div>

      {/* Submission Versions */}
      {submissions.map((submission) => {
        const StatusIcon = getStatusIcon(
          submission.status,
        );

        return (
          <div
            key={submission._id}
            className="rounded-xl border border-zinc-200 bg-white p-5"
          >
            {/* Submission Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-semibold text-zinc-950">
                    Version {submission.version}
                  </h4>

                  <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
                    <StatusIcon className="h-3 w-3" />

                    {getStatusLabel(
                      submission.status,
                    )}
                  </span>
                </div>

                <p className="mt-1 text-xs text-zinc-500">
                  {formatSubmissionDate(
                    submission.submittedAt ??
                      submission.createdAt,
                  )}
                </p>
              </div>
            </div>

            {/* Submission Message */}
            {submission.message && (
              <div className="mt-4 rounded-lg bg-zinc-50 p-4">
                <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-700">
                  {submission.message}
                </p>
              </div>
            )}

            {/* Attachments */}
            {submission.attachments &&
              submission.attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-zinc-900">
                    Deliverables
                  </p>

                  {submission.attachments.map(
                    (attachment, index) => {
                      const isImage =
                        attachment.mimeType?.startsWith(
                          "image/",
                        );

                      return (
                        <div
                          key={`${attachment.url}-${index}`}
                          className="flex items-center gap-3 rounded-lg border border-zinc-200 p-3"
                        >
                          {/* Preview / File Icon */}
                          {isImage ? (
                            <img
                              src={attachment.url}
                              alt={attachment.name}
                              className="h-12 w-12 shrink-0 rounded-md object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-zinc-100">
                              <Download className="h-4 w-4 text-zinc-600" />
                            </div>
                          )}

                          {/* File Details */}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-zinc-900">
                              {attachment.name}
                            </p>

                            <p className="text-xs text-zinc-500">
                              {formatSize(
                                attachment.size,
                              )}
                            </p>
                          </div>

                          {/* View Button */}
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex shrink-0 items-center gap-1 rounded-md border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </a>
                        </div>
                      );
                    },
                  )}
                </div>
              )}
          </div>
        );
      })}
    </div>
  );
}
