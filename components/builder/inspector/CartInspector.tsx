"use client";

type CartInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
};

export function CartInspector({
  selectedBlock,
  updateSelectedBlock,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
}: CartInspectorProps) {
  return (
    <div id="inspector-cart" className={inspectorCardClass()}>
      <div className={inspectorLabelClass()}>Cart</div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Heading</div>
        <input
          type="text"
          value={selectedBlock.data.heading ?? ""}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "cart"
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
        <div className={inspectorLabelClass()}>Tax Rate</div>
        <input
          type="number"
          min="0"
          step="0.01"
          value={selectedBlock.data.taxRate ?? 0}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "cart"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      taxRate: Math.max(0, Number(e.target.value) || 0),
                    },
                  },
            )
          }
          className={inspectorInputClass()}
          placeholder="0.00"
        />

        <div className="mt-1 text-xs text-neutral-500">
          Use decimal format. Example: 0.07 = 7%
        </div>
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Discount Type</div>
        <select
          value={selectedBlock.data.discountType ?? "flat"}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "cart"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      discountType: e.target.value as "flat" | "percent",
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        >
          <option value="flat">Flat Amount</option>
          <option value="percent">Percent</option>
        </select>
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          {selectedBlock.data.discountType === "percent"
            ? "Discount Percent"
            : "Discount Amount"}
        </div>

        <input
          type="number"
          min="0"
          step="0.01"
          value={selectedBlock.data.discount ?? 0}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "cart"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      discount: Math.max(0, Number(e.target.value) || 0),
                    },
                  },
            )
          }
          className={inspectorInputClass()}
          placeholder={
            selectedBlock.data.discountType === "percent" ? "10" : "0.00"
          }
        />

        <div className="mt-1 text-xs text-neutral-500">
          {selectedBlock.data.discountType === "percent"
            ? "Example: 10 = 10% off"
            : "Flat amount removed from subtotal after tax."}
        </div>
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Currency</div>
        <input
          type="text"
          value={selectedBlock.data.currency ?? "usd"}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "cart"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      currency: e.target.value.trim().toLowerCase() || "usd",
                    },
                  },
            )
          }
          className={inspectorInputClass()}
          placeholder="usd"
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Button Text</div>
        <input
          type="text"
          value={selectedBlock.data.buttonText ?? ""}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "cart"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      buttonText: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Empty Cart Message</div>
        <input
          type="text"
          value={selectedBlock.data.emptyMessage ?? ""}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "cart"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      emptyMessage: e.target.value,
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