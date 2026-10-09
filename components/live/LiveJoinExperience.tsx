// components\live\LiveJoinExperience.tsx

"use client";

import {
  useEffect,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type FormEvent,
} from "react";

import { uploadImage } from "@/lib/uploadImage";

import { useLiveRuntime } from "@/components/live/LiveRuntimeContext";

type LiveJoinExperienceProps = {
  heading?: string;
  helperText?: string;
  namePlaceholder?: string;
  joinButtonLabel?: string;
  connectedLabel?: string;
  leaveButtonLabel?: string;

  headingStyle?: CSSProperties;
  helperTextStyle?: CSSProperties;
  namePlaceholderStyle?: CSSProperties;
  joinButtonTextStyle?: CSSProperties;
  connectedLabelStyle?: CSSProperties;
  participantNameStyle?: CSSProperties;
  connectedMessageStyle?: CSSProperties;
  leaveButtonTextStyle?: CSSProperties;

  inputStyle?: CSSProperties;
  joinButtonStyle?: CSSProperties;
  leaveButtonStyle?: CSSProperties;

  avatarButtonTextStyle?: CSSProperties;
  replaceButtonTextStyle?: CSSProperties;
  removeButtonTextStyle?: CSSProperties;

  avatarButtonStyle?: CSSProperties;
  replaceButtonStyle?: CSSProperties;
  removeButtonStyle?: CSSProperties;
};

export default function LiveJoinExperience({
  heading = "Join Live Experience",
  helperText = "Enter a display name to participate.",
  namePlaceholder = "Display name",
  joinButtonLabel = "Join Experience",
  connectedLabel = "Live Participant",
  leaveButtonLabel = "Leave Experience",
  headingStyle,
helperTextStyle,
namePlaceholderStyle,
joinButtonTextStyle,
connectedLabelStyle,
participantNameStyle,
connectedMessageStyle,
leaveButtonTextStyle,
  inputStyle,
  joinButtonStyle,
  leaveButtonStyle,

  avatarButtonTextStyle,
  replaceButtonTextStyle,
  removeButtonTextStyle,

  avatarButtonStyle,
  replaceButtonStyle,
  removeButtonStyle,
}: LiveJoinExperienceProps) {
const {
  experience,
  participant,
  authenticated,
  sharedState,
  sessionLoading,
  joining,
  leaving,
  joinError,
  joinExperience,
  leaveExperience,
} = useLiveRuntime();

  const [displayName, setDisplayName] =
    useState("");

const [avatarFile, setAvatarFile] =
  useState<File | null>(null);

const [avatarPreviewUrl, setAvatarPreviewUrl] =
  useState<string | null>(null);

const [avatarUploading, setAvatarUploading] =
  useState(false);

const [avatarError, setAvatarError] =
  useState<string | null>(null);

  useEffect(() => {
  return () => {
    if (avatarPreviewUrl) {
      URL.revokeObjectURL(
        avatarPreviewUrl,
      );
    }
  };
}, [avatarPreviewUrl]);

function handleAvatarChange(
  event: ChangeEvent<HTMLInputElement>,
) {
  const file =
    event.target.files?.[0] ?? null;

  setAvatarError(null);

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    setAvatarError(
      "Please choose an image file.",
    );

    event.target.value = "";
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    setAvatarError(
      "Avatar image must be 10MB or smaller.",
    );

    event.target.value = "";
    return;
  }

  const previewUrl =
    URL.createObjectURL(file);

  setAvatarFile(file);

  setAvatarPreviewUrl(
    (currentPreviewUrl) => {
      if (currentPreviewUrl) {
        URL.revokeObjectURL(
          currentPreviewUrl,
        );
      }

      return previewUrl;
    },
  );

  event.target.value = "";
}

function handleRemoveAvatar() {
  setAvatarFile(null);
  setAvatarError(null);

  setAvatarPreviewUrl(
    (currentPreviewUrl) => {
      if (currentPreviewUrl) {
        URL.revokeObjectURL(
          currentPreviewUrl,
        );
      }

      return null;
    },
  );
}

async function handleSubmit(
  event: FormEvent<HTMLFormElement>,
) {
  event.preventDefault();

  setAvatarError(null);

  try {
    let avatarUrl: string | null = null;

    if (avatarFile) {
      setAvatarUploading(true);

      const uploaded =
        await uploadImage(avatarFile);

      avatarUrl = uploaded.url;
    }

    const joined =
      await joinExperience(
        displayName,
        avatarUrl,
      );

    if (!joined) {
      return;
    }

    setDisplayName("");
    setAvatarFile(null);

    setAvatarPreviewUrl(
      (currentPreviewUrl) => {
        if (currentPreviewUrl) {
          URL.revokeObjectURL(
            currentPreviewUrl,
          );
        }

        return null;
      },
    );
  } catch (error) {
    console.error(
      "Live avatar upload failed:",
      error,
    );

    setAvatarError(
      "Unable to upload your avatar. Please try again.",
    );
  } finally {
    setAvatarUploading(false);
  }
}

  if (!experience) {
    return null;
  }

  if (sessionLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-4">
        <div className="text-center text-sm opacity-70">
          Loading Live experience...
        </div>
      </div>
    );
  }

if (authenticated && participant) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-center">
      <div>
        <div
          className="text-xs font-medium uppercase tracking-wide opacity-60"
          style={connectedLabelStyle}
        >
          {connectedLabel}
        </div>

        <div
          className="mt-1 text-xl font-semibold"
          style={participantNameStyle}
        >
          {participant.displayName}
        </div>
      </div>

      <div
        className="text-sm opacity-70"
        style={connectedMessageStyle}
      >
        You&apos;re connected to{" "}
        {experience.name}.
      </div>

{typeof sharedState?.state?.message === "string" ? (
  <div className="text-sm font-medium">
    {sharedState.state.message}
  </div>
) : null}

{typeof sharedState?.state?.testValue === "number" ? (
  <div className="text-xs opacity-60">
    Test value: {sharedState.state.testValue}
  </div>
) : null}

      <button
        type="button"
        disabled={leaving}
        onClick={() => {
          void leaveExperience();
        }}
        className="rounded-lg border border-current px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          ...(leaveButtonStyle ?? {}),
          ...(leaveButtonTextStyle ?? {}),
        }}
      >
        {leaving ? "Leaving..." : leaveButtonLabel}
      </button>
    </div>
  );
}

return (
  <div className="flex h-full w-full flex-col items-center justify-center">
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm"
    >
      <div className="text-center">
        <div
          className="text-xl font-semibold"
          style={headingStyle}
        >
          {heading}
        </div>

        <div
          className="mt-1 whitespace-pre-wrap text-sm opacity-70"
          style={helperTextStyle}
        >
          {helperText}
        </div>
      </div>


      <input
        type="text"
        value={displayName}
        maxLength={50}
        autoComplete="off"
        disabled={joining || avatarUploading}
        onChange={(event) =>
          setDisplayName(event.target.value)
        }
        placeholder={namePlaceholder}
        className="mt-4 w-full rounded-lg border border-current/20 bg-transparent px-3 py-2 outline-none"
        style={{
          ...(inputStyle ?? {}),
          ...(namePlaceholderStyle ?? {}),
        }}
      />

      <div className="mt-3">
        <div className="mb-2 text-sm font-medium">
          Player avatar{" "}
          <span className="font-normal opacity-60">
            (optional)
          </span>
        </div>

        {avatarPreviewUrl ? (
          <div className="flex items-center gap-3">
            <img
              src={avatarPreviewUrl}
              alt="Avatar preview"
              className="h-16 w-16 rounded-full object-cover"
            />

            <div className="flex flex-wrap gap-2">
<label
  className="cursor-pointer rounded-lg border border-current/20 px-3 py-2 text-sm"
  style={{
    ...(replaceButtonStyle ?? {}),
    ...(replaceButtonTextStyle ?? {}),
  }}
>
  Replace

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={
                    joining ||
                    avatarUploading
                  }
                  onChange={handleAvatarChange}
                />
              </label>

              <button
                type="button"
                disabled={
                  joining ||
                  avatarUploading
                }
onClick={handleRemoveAvatar}
className="rounded-lg border border-current/20 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
style={{
  ...(removeButtonStyle ?? {}),
  ...(removeButtonTextStyle ?? {}),
}}
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
<label
  className="inline-flex cursor-pointer items-center rounded-lg border border-current/20 px-3 py-2 text-sm"
  style={{
    ...(avatarButtonStyle ?? {}),
    ...(avatarButtonTextStyle ?? {}),
  }}
>
  Upload avatar

            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={
                joining ||
                avatarUploading
              }
              onChange={handleAvatarChange}
            />
          </label>
        )}

        {avatarError ? (
          <div className="mt-2 text-sm text-red-600">
            {avatarError}
          </div>
        ) : null}
      </div>

      {joinError ? (
        <div className="mt-2 text-sm text-red-600">
          {joinError}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={
          joining ||
          avatarUploading ||
          !displayName.trim()
        }
        className="mt-3 w-full rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          ...(joinButtonStyle ?? {}),
          ...(joinButtonTextStyle ?? {}),
        }}
      >
        {avatarUploading
          ? "Uploading avatar..."
          : joining
            ? "Joining..."
            : joinButtonLabel}
      </button>
    </form>
  </div>
);
}