"use client";

import { useEffect, useRef } from "react";

import type { InspectorFocusTarget } from "../types";

type SelectedBlockLike =
  | {
      id: string;
      type:
        | "poll"
        | "rsvp"
        | "countdown"
        | "faq"
        | "thread"
        | "links"
        | "image_carousel"
        | string;
    }
  | null
  | undefined;

type UseInspectorFocusArgs = {
  inspectorFocusTarget: InspectorFocusTarget;
  setInspectorFocusTarget: React.Dispatch<React.SetStateAction<InspectorFocusTarget>>;
  selectedBlock: SelectedBlockLike;
  inspectorSectionId: (target: InspectorFocusTarget) => string | null;
};

export function useInspectorFocus({
  inspectorFocusTarget,
  setInspectorFocusTarget,
  selectedBlock,
  inspectorSectionId,
}: UseInspectorFocusArgs) {
  const pollQuestionInputRef = useRef<HTMLTextAreaElement | null>(null);
  const pollOptionInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const rsvpHeadingInputRef = useRef<HTMLInputElement | null>(null);

  const countdownHeadingInputRef = useRef<HTMLInputElement | null>(null);
  const countdownTargetInputRef = useRef<HTMLInputElement | null>(null);
  const countdownCompletedInputRef = useRef<HTMLInputElement | null>(null);

  const faqQuestionInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const faqAnswerInputRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  const threadSubjectInputRef = useRef<HTMLInputElement | null>(null);

  const linksHeadingInputRef = useRef<HTMLInputElement | null>(null);
  const linksItemLabelInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const linksItemUrlInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const carouselHeadingInputRef = useRef<HTMLInputElement | null>(null);
  const carouselItemTitleInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const carouselItemSubtitleInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const carouselItemHrefInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (!inspectorFocusTarget || !selectedBlock) return;

    const sectionId = inspectorSectionId(inspectorFocusTarget);
    if (sectionId) {
      requestAnimationFrame(() => {
        document.getElementById(sectionId)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
    }

    if (
      inspectorFocusTarget.type === "poll-question" &&
      selectedBlock.type === "poll" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = pollQuestionInputRef.current;
      if (el) {
        el.focus();
        const len = el.value.length;
        el.setSelectionRange(len, len);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "poll-option" &&
      selectedBlock.type === "poll" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = pollOptionInputRefs.current[inspectorFocusTarget.optionId];
      if (el) {
        el.focus();
        const len = el.value.length;
        el.setSelectionRange(len, len);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "rsvp-heading" &&
      selectedBlock.type === "rsvp" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = rsvpHeadingInputRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "countdown-heading" &&
      selectedBlock.type === "countdown" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = countdownHeadingInputRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "countdown-target" &&
      selectedBlock.type === "countdown" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = countdownTargetInputRef.current;
      if (el) {
        el.focus();
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "countdown-completed" &&
      selectedBlock.type === "countdown" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = countdownCompletedInputRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "faq-question" &&
      selectedBlock.type === "faq" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = faqQuestionInputRefs.current[inspectorFocusTarget.itemId];
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "faq-answer" &&
      selectedBlock.type === "faq" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = faqAnswerInputRefs.current[inspectorFocusTarget.itemId];
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "thread-subject" &&
      selectedBlock.type === "thread" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = threadSubjectInputRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "links-heading" &&
      selectedBlock.type === "links" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = linksHeadingInputRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "links-item-label" &&
      selectedBlock.type === "links" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = linksItemLabelInputRefs.current[inspectorFocusTarget.itemId];
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "links-item-url" &&
      selectedBlock.type === "links" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = linksItemUrlInputRefs.current[inspectorFocusTarget.itemId];
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "carousel-heading" &&
      selectedBlock.type === "image_carousel" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = carouselHeadingInputRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "carousel-item-title" &&
      selectedBlock.type === "image_carousel" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = carouselItemTitleInputRefs.current[inspectorFocusTarget.itemId];
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "carousel-item-subtitle" &&
      selectedBlock.type === "image_carousel" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = carouselItemSubtitleInputRefs.current[inspectorFocusTarget.itemId];
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
      setInspectorFocusTarget(null);
      return;
    }

    if (
      inspectorFocusTarget.type === "carousel-item-href" &&
      selectedBlock.type === "image_carousel" &&
      inspectorFocusTarget.blockId === selectedBlock.id
    ) {
      const el = carouselItemHrefInputRefs.current[inspectorFocusTarget.itemId];
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
      setInspectorFocusTarget(null);
      return;
    }
  }, [
    inspectorFocusTarget,
    selectedBlock,
    setInspectorFocusTarget,
    inspectorSectionId,
  ]);

  return {
    pollQuestionInputRef,
    pollOptionInputRefs,
    rsvpHeadingInputRef,
    countdownHeadingInputRef,
    countdownTargetInputRef,
    countdownCompletedInputRef,
    faqQuestionInputRefs,
    faqAnswerInputRefs,
    threadSubjectInputRef,
    linksHeadingInputRef,
    linksItemLabelInputRefs,
    linksItemUrlInputRefs,
    carouselHeadingInputRef,
    carouselItemTitleInputRefs,
    carouselItemSubtitleInputRefs,
    carouselItemHrefInputRefs,
  };
}