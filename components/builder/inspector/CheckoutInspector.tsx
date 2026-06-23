"use client";

type CheckoutInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
  inspectorTextareaClass: () => string;
};

export function CheckoutInspector({
  selectedBlock,
  updateSelectedBlock,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
  inspectorTextareaClass,
}: CheckoutInspectorProps) {
  return (
    <div id="inspector-checkout" className={inspectorCardClass()}>
      <div className={inspectorLabelClass()}>Checkout</div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Product Name</div>
        <input
          type="text"
          value={selectedBlock.data.productName}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "checkout"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      productName: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Description</div>
        <textarea
          value={selectedBlock.data.description ?? ""}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "checkout"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      description: e.target.value,
                    },
                  },
            )
          }
          className={inspectorTextareaClass()}
          placeholder="Add a short description here."
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Price</div>
        <input
          type="number"
          value={selectedBlock.data.price}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "checkout"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      price: Number(e.target.value),
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Currency</div>
        <input
          type="text"
          value={selectedBlock.data.currency}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "checkout"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      currency: e.target.value,
                    },
                  },
            )
          }
          className={inspectorInputClass()}
        />
      </div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Button Spacing</div>
        <input
          type="number"
          min="0"
          max="100"
          value={selectedBlock.data.buttonSpacing ?? 12}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "checkout"
                ? block
                : {
                    ...block,
                    data: {
                      ...block.data,
                      buttonSpacing: Math.max(
                        0,
                        Number(e.target.value) || 0,
                      ),
                    },
                  },
            )
          }
          className={inspectorInputClass()}
          placeholder="12"
        />
      </div>

      <div className="mt-4">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={selectedBlock.data.allowQuantity}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "checkout"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        allowQuantity: e.target.checked,
                      },
                    },
              )
            }
          />
          Allow Quantity
        </label>
      </div>
    </div>
  );
}