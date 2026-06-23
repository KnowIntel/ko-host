"use client";

/**
 * Map Location inspector section
 * Extracted from DesignLayoutEditor.
 *
 * DesignLayoutEditor remains the middleman and only renders this when:
 * selectedBlock?.type === "map_location"
 */
type MapLocationInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
};

export function MapLocationInspector({
  selectedBlock,
  updateSelectedBlock,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
}: MapLocationInspectorProps) {
  return (
    <div className={inspectorCardClass()}>
      <div className={inspectorLabelClass()}>Map</div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Heading</div>
        <input
          type="text"
          value={selectedBlock.data.heading ?? ""}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "map_location"
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
        <div className={inspectorLabelClass()}>Location Name</div>
        <input
          type="text"
          value={selectedBlock.data.locationName ?? ""}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "map_location"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      locationName: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Address</div>
        <input
          type="text"
          value={selectedBlock.data.address ?? ""}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "map_location"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      address: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Map URL (optional)</div>
        <input
          type="text"
          value={selectedBlock.data.mapUrl ?? ""}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "map_location"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      mapUrl: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>
    </div>
  );
}