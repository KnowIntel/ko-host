"use client";

import type {
  EnrollmentBoardStyleTarget,
  EnrollmentBoardTextTarget,
} from "@/components/builder/formatting/enrollmentBoardFormatting";

/**
 * Enrollment Board inspector section
 * Extracted from DesignLayoutEditor.
 *
 * DesignLayoutEditor remains the middleman and only renders this when:
 * selectedBlock?.type === "enrollment_board"
 */
type EnrollmentBoardInspectorProps = {
  selectedBlock: any;
  selectedBlockFromDraft: any;
  draft: any;

  updateSelectedBlock: any;

  enrollmentBoardTextTarget: EnrollmentBoardTextTarget;
  setEnrollmentBoardTextTarget: (
    target: EnrollmentBoardTextTarget,
  ) => void;

  enrollmentBoardStyleTarget: EnrollmentBoardStyleTarget;
  setEnrollmentBoardStyleTarget: (
    target: EnrollmentBoardStyleTarget,
  ) => void;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
  inspectorTextareaClass: () => string;
};

export function EnrollmentBoardInspector({
  selectedBlock,
  selectedBlockFromDraft,
  draft,
  updateSelectedBlock,

  enrollmentBoardTextTarget,
  setEnrollmentBoardTextTarget,
  enrollmentBoardStyleTarget,
  setEnrollmentBoardStyleTarget,

  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
  inspectorTextareaClass,
}: EnrollmentBoardInspectorProps) {
  return (
    <div className={inspectorCardClass()}>
      {/* Enrollment Board */}
    <div className={inspectorLabelClass()}>Enrollment Board</div>

    <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
  <div className={inspectorLabelClass()}>Formatting</div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>Text Target</div>
    <select
      value={enrollmentBoardTextTarget}
      onChange={(e) =>
        setEnrollmentBoardTextTarget(
          e.target.value as EnrollmentBoardTextTarget,
        )
      }
      className={inspectorInputClass()}
    >
      <option value="heading">Heading</option>
      <option value="subtitle">Subtitle</option>
      <option value="fieldLabel">Field Label</option>
      <option value="placeholderText">Placeholder Text</option>
      <option value="fieldText">Field Text</option>
      <option value="totalEnrolledLabel">Total Enrolled Label</option>
      <option value="submitButtonText">Submit Button Text</option>
      <option value="successMessage">Success Message</option>
      <option value="alreadyEnrolledMessage">Already Enrolled Message</option>
      <option value="emptyListMessage">Empty List Message</option>
    </select>
  </div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>Style Target</div>
    <select
      value={enrollmentBoardStyleTarget}
      onChange={(e) =>
        setEnrollmentBoardStyleTarget(
          e.target.value as EnrollmentBoardStyleTarget,
        )
      }
      className={inspectorInputClass()}
    >
      <option value="field">Field</option>
      <option value="enrollmentSection">Enrollment Section</option>
      <option value="submitButton">Submit Button</option>
      <option value="block">Block</option>
    </select>
  </div>
</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Heading</div>
      <input
        type="text"
        value={selectedBlock.data.heading ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "enrollment_board"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    heading: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Subtitle</div>
      <textarea
        value={selectedBlock.data.subtitle ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "enrollment_board"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    subtitle: e.target.value,
                  },
                },
          )
        }
        className={inspectorTextareaClass()}
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Layout Variant</div>
      <select
        value={selectedBlock.data.variant ?? "classic_board"}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "enrollment_board"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    variant: e.target.value as
                      | "classic_board"
                      | "member_wall"
                      | "signature_list",
                  },
                },
          )
        }
        className={inspectorInputClass()}
      >
        <option value="classic_board">Classic Board</option>
        <option value="member_wall">Member Wall</option>
        <option value="signature_list">Signature List</option>
      </select>
    </div>

    <div className="mt-4">
  <div className={inspectorLabelClass()}>Member List Position</div>
  <select
    value={selectedBlock.data.memberListPosition ?? "standard"}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "enrollment_board"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                memberListPosition: e.target.value as "standard" | "profile",
              },
            },
      )
    }
    className={inspectorInputClass()}
  >
    <option value="standard">Standard — Below submit button</option>
    <option value="profile">Profile — Beside sign-up fields</option>
  </select>
</div>

{(selectedBlock.data.memberListPosition ?? "standard") === "profile" ? (
  <div className="mt-4">
    <div className={inspectorLabelClass()}>
      Field Section Width: {selectedBlock.data.fieldSectionWidth ?? 55}%
    </div>

    <input
      type="range"
      min={35}
      max={70}
      step={5}
      value={selectedBlock.data.fieldSectionWidth ?? 55}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "enrollment_board"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  fieldSectionWidth: Number(e.target.value),
                },
              },
        )
      }
      className="mt-2 w-full"
    />
  </div>
) : null}

    <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
  <div className={inspectorLabelClass()}>Linked Enrollment Display Blocks</div>

  <p className="mt-2 text-xs leading-relaxed text-neutral-500">
    Optionally connect this Enrollment Board to existing Image and Label blocks.
    After a visitor enrolls, those linked blocks can show that visitor’s own
    profile image, name, and quote on their browser.
  </p>

  <div className="mt-4">
    <div className={inspectorLabelClass()}>Linked Profile Image Block</div>
    <select
      value={selectedBlock.data.linkedProfileImageBlockId ?? ""}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "enrollment_board"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  linkedProfileImageBlockId: e.target.value,
                },
              },
        )
      }
      className={inspectorInputClass()}
    >
      <option value="">None</option>
      {draft.blocks
        .filter((item: any) => item.type === "image")
        .map((item: any) => (
          <option key={item.id} value={item.id}>
            {item.label || "Image Block"}
          </option>
        ))}
    </select>
  </div>

  <div className="mt-4">
    <div className={inspectorLabelClass()}>Linked Name Label Block</div>
    <select
      value={selectedBlock.data.linkedNameLabelBlockId ?? ""}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "enrollment_board"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  linkedNameLabelBlockId: e.target.value,
                },
              },
        )
      }
      className={inspectorInputClass()}
    >
      <option value="">None</option>
      {draft.blocks
        .filter((item: any) => item.type === "label")
        .map((item: any) => (
          <option key={item.id} value={item.id}>
            {item.label || "Label Block"}
          </option>
        ))}
    </select>
  </div>

  <div className="mt-4">
    <div className={inspectorLabelClass()}>Linked Quote Label Block</div>
    <select
      value={selectedBlock.data.linkedQuoteLabelBlockId ?? ""}
      onChange={(e) =>
        updateSelectedBlock((block: any) =>
          block.type !== "enrollment_board"
            ? block
            : {
                ...block,
                data: {
                  ...block.data,
                  linkedQuoteLabelBlockId: e.target.value,
                },
              },
        )
      }
      className={inspectorInputClass()}
    >
      <option value="">None</option>
      {draft.blocks
        .filter((item: any) => item.type === "label")
        .map((item: any) => (
          <option key={item.id} value={item.id}>
            {item.label || "Label Block"}
          </option>
        ))}
    </select>
  </div>

  <div className="mt-4">
  <div className={inspectorLabelClass()}>Linked Gallery Block</div>
  <select
    value={selectedBlock.data.linkedGalleryBlockId ?? ""}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "enrollment_board"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                linkedGalleryBlockId: e.target.value,
              },
            },
      )
    }
    className={inspectorInputClass()}
  >
    <option value="">None</option>
    {draft.blocks
      .filter((item: any) => item.type === "gallery")
      .map((item: any) => (
        <option key={item.id} value={item.id}>
          {item.label || "Gallery Block"}
        </option>
      ))}
  </select>
</div>

<div className="mt-4">
  <div className={inspectorLabelClass()}>Linked Carousel Block</div>
  <select
    value={selectedBlock.data.linkedCarouselBlockId ?? ""}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "enrollment_board"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                linkedCarouselBlockId: e.target.value,
              },
            },
      )
    }
    className={inspectorInputClass()}
  >
    <option value="">None</option>
    {draft.blocks
      .filter((item: any) => item.type === "image_carousel")
      .map((item: any) => (
        <option key={item.id} value={item.id}>
          {item.label || "Carousel Block"}
        </option>
      ))}
  </select>
</div>
</div>

    <div className="mt-4 grid grid-cols-1 gap-3">
      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={selectedBlock.data.showHeading !== false}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "enrollment_board"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      showHeading: e.target.checked,
                    },
                  },
            )
          }
        />
        Show heading
      </label>

      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={selectedBlock.data.showSubtitle !== false}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "enrollment_board"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      showSubtitle: e.target.checked,
                    },
                  },
            )
          }
        />
        Show subtitle
      </label>

      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={selectedBlock.data.showQuoteField !== false}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "enrollment_board"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      showQuoteField: e.target.checked,
                    },
                  },
            )
          }
        />
        Show quote field
      </label>

      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={selectedBlock.data.showEmailField !== false}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "enrollment_board"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      showEmailField: e.target.checked,
                    },
                  },
            )
          }
        />
        Show email field
      </label>

      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={selectedBlock.data.showImageUpload !== false}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "enrollment_board"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      showImageUpload: e.target.checked,
                    },
                  },
            )
          }
        />
        Show profile image upload
      </label>
    </div>

    <label className="mt-4 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
  <input
    type="checkbox"
    checked={selectedBlock.data.showTotalEnrolled !== false}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "enrollment_board"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                showTotalEnrolled: e.target.checked,
              },
            },
      )
    }
  />
  Show Total Enrolled
</label>

<label className="mt-4 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
  <input
    type="checkbox"
    checked={Boolean(selectedBlock.data.showMetadataField)}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "enrollment_board"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                showMetadataField: e.target.checked,
              },
            },
      )
    }
  />
  Show Metadata Field
</label>

    <label className="mt-4 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
  <input
    type="checkbox"
    checked={
      (selectedBlockFromDraft?.data as any)?.showEnrollmentList !== false
    }
    onChange={(e) =>
      updateSelectedBlock((block: any) => ({
        ...block,
        data: {
          ...(block.data as any),
          showEnrollmentList: e.target.checked,
        },
      }))
    }
  />
  <span>Show Enrollment List</span>
</label>

    <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
      <div className={inspectorLabelClass()}>Field Labels</div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Name Label</div>
        <input
          type="text"
          value={selectedBlock.data.nameLabel ?? "Name"}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "enrollment_board"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      nameLabel: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
  <div className={inspectorLabelClass()}>Metadata Label</div>
  <input
    type="text"
    value={selectedBlock.data.metadataLabel ?? "Metadata"}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "enrollment_board"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                metadataLabel: e.target.value,
              },
            },
      )
    }
    className={inspectorInputClass()}
  />
</div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Quote Label</div>
        <input
          type="text"
          value={selectedBlock.data.quoteLabel ?? "Quote or message"}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "enrollment_board"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      quoteLabel: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Email Label</div>
        <input
          type="text"
          value={selectedBlock.data.emailLabel ?? "Email"}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "enrollment_board"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      emailLabel: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Image Label</div>
        <input
          type="text"
          value={selectedBlock.data.imageLabel ?? "Profile image"}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "enrollment_board"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      imageLabel: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>


    </div>

    <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
      <div className={inspectorLabelClass()}>Requirements</div>

      <div className="mt-4 grid grid-cols-1 gap-3">
        <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-3 text-sm text-neutral-800">
          <input
            type="checkbox"
            checked={Boolean(selectedBlock.data.requireQuote)}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "enrollment_board"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        requireQuote: e.target.checked,
                      },
                    },
              )
            }
          />
          Require quote
        </label>

        <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-3 text-sm text-neutral-800">
          <input
            type="checkbox"
            checked={Boolean(selectedBlock.data.requireEmail)}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "enrollment_board"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        requireEmail: e.target.checked,
                      },
                    },
              )
            }
          />
          Require email
        </label>

        <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-3 text-sm text-neutral-800">
          <input
            type="checkbox"
            checked={Boolean(selectedBlock.data.requireImage)}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "enrollment_board"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        requireImage: e.target.checked,
                      },
                    },
              )
            }
          />
          Require profile image
        </label>
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Quote Max Characters</div>
        <input
          type="number"
          min={25}
          max={500}
          value={selectedBlock.data.quoteMaxLength ?? 150}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "enrollment_board"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      quoteMaxLength: Math.max(
                        25,
                        Math.min(500, Number(e.target.value) || 150),
                      ),
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>
    </div>

    <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
      <div className={inspectorLabelClass()}>Public List</div>

      <div className="mt-4 grid grid-cols-1 gap-3">
        <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-3 text-sm text-neutral-800">
          <input
            type="checkbox"
            checked={selectedBlock.data.showProfileImages !== false}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "enrollment_board"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        showProfileImages: e.target.checked,
                      },
                    },
              )
            }
          />
          Show profile images
        </label>

        <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-3 text-sm text-neutral-800">
          <input
            type="checkbox"
            checked={selectedBlock.data.showQuotes !== false}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "enrollment_board"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        showQuotes: e.target.checked,
                      },
                    },
              )
            }
          />
          Show quotes
        </label>

        <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-3 text-sm text-neutral-800">
          <input
            type="checkbox"
            checked={selectedBlock.data.showEnrollmentCount !== false}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "enrollment_board"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        showEnrollmentCount: e.target.checked,
                      },
                    },
              )
            }
          />
          Show enrollment count
        </label>
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Sort Order</div>
        <select
          value={selectedBlock.data.sortOrder ?? "newest"}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "enrollment_board"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      sortOrder: e.target.value as
                        | "newest"
                        | "oldest"
                        | "alphabetical",
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="alphabetical">Alphabetical</option>
        </select>
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Avatar Shape</div>
        <select
          value={selectedBlock.data.avatarShape ?? "circle"}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "enrollment_board"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      avatarShape: e.target.value as
                        | "circle"
                        | "rounded"
                        | "square",
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        >
          <option value="circle">Circle</option>
          <option value="rounded">Rounded</option>
          <option value="square">Square</option>
        </select>
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Max Visible Entries</div>
        <input
          type="number"
          min={1}
          max={200}
          value={selectedBlock.data.maxVisibleEntries ?? 24}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "enrollment_board"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      maxVisibleEntries: Math.max(
                        1,
                        Math.min(200, Number(e.target.value) || 24),
                      ),
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>
    </div>

    <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
      <div className="mt-4">
  <div className={inspectorLabelClass()}>Total Enrolled Label</div>
  <input
    type="text"
    value={selectedBlock.data.memberTotalLabel ?? " enrolled"}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "enrollment_board"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                memberTotalLabel: e.target.value,
              },
            },
      )
    }
    className={inspectorInputClass()}
    placeholder=" enrolled"
  />
</div>

      <div className={inspectorLabelClass()}>Messages</div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Submit Button Text</div>
        <input
          type="text"
          value={selectedBlock.data.submitButtonText ?? "Submit"}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "enrollment_board"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      submitButtonText: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Success Message</div>
        <input
          type="text"
          value={
            selectedBlock.data.successMessage ??
            "You’ve been added to the board."
          }
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "enrollment_board"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      successMessage: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Already Enrolled Message</div>
        <input
          type="text"
          value={
            selectedBlock.data.alreadyEnrolledMessage ??
            "You’re already enrolled from this device."
          }
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "enrollment_board"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      alreadyEnrolledMessage: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Empty List Message</div>
        <input
          type="text"
          value={selectedBlock.data.emptyListMessage ?? "No enrollments yet."}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "enrollment_board"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      emptyListMessage: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>
    </div>
    </div>
  );
}