
class OrderHelper {
    static STATUS_PENDING = 'Pending';
    static STATUS_PROCESSING = 'Processing';
    static STATUS_PROCESSED = 'Processed';
    static STATUS_DISPATCHED = 'Dispatched';
    static STATUS_DELIVERED = 'Delivered';
    static STATUS_WAITING = 'Waiting';
    static STATUS_CANCELLED = 'Cancelled';

    constructor(order, user) {
        this.order = order
        this.user = user
    }

    canIEdit() {
        if (!this.order.assignedTo)
            return false;

        return this.order.assignedTo.id === this.user.id;
    }

    amIAdmin() {
        return true
    }

    isStatus(status) {
        if (!Array.isArray(status)) {
            status = [status]
        }

        return status.includes(this.order.status)
    }

    canAssigned() {
        return this.order.assignedTo === null;
    }

    isAllItemsProcessed() {
        for (const detail of this.order.details) {
            if (detail.status === 'Pending') {
                return false
            }
        }

        return true;
    }

    static PERMISSION_ACCEPT_ORDER = 'accept-order';
    static PERMISSION_ASSIGN_USER  = 'assign-user';
    static PERMISSION_REMOVE_USER  = 'remove-user';

    static PERMISSION_UPDATE_STATUS   = 'update-status';
    static PERMISSION_STATUS_PROCESSING = 'update-status-processing';
    static PERMISSION_STATUS_PROCESSED  = 'update-status-processed';
    static PERMISSION_STATUS_DISPATCHED = 'update-status-dispatched';
    static PERMISSION_STATUS_DELIVERED  = 'update-status-delivered';
    static PERMISSION_STATUS_CANCELLED  = 'update-status-cancelled';

    static PERMISSION_PAYMENT_PAY    = 'payment-pay';
    static PERMISSION_PAYMENT_REFUND = 'payment-refund';

    static PERMISSION_ITEM_PROCESS = 'item-process';
    static PERMISSION_ITEM_CANCEL  = 'item-cancel';
    static PERMISSION_ITEM_UPDATE_STATUS  = 'item-status';

    /**
     * WARNING:
     * If you change anything below you also have to change in admin panel && delivery app.
     * Permissions for api, admin panel & delivery app are not same they differ slightly.
     */
    canI(action) {
        switch (action) {
            case OrderHelper.PERMISSION_ACCEPT_ORDER:
                return this.canAssigned() && (this.amIAdmin() || this.isStatus(['Pending']));

            case OrderHelper.PERMISSION_ASSIGN_USER:
                return this.canAssigned() && this.amIAdmin();

            case OrderHelper.PERMISSION_REMOVE_USER:
                return (this.isStatus(['Pending']) && this.canIEdit()) || this.amIAdmin();

            case OrderHelper.PERMISSION_UPDATE_STATUS:
                return !this.isStatus(['Waiting', 'Cancelled', 'Delivered']) && (this.canIEdit()|| this.amIAdmin());

            case OrderHelper.PERMISSION_STATUS_PROCESSING:
                return this.isStatus(['Pending']) && this.canIEdit();

            case OrderHelper.PERMISSION_STATUS_PROCESSED:
                return this.isStatus(['Processing']) && this.canIEdit() && this.isAllItemsProcessed();

            case OrderHelper.PERMISSION_STATUS_DISPATCHED:
                return this.isStatus(['Processed']) && this.canIEdit();

            case OrderHelper.PERMISSION_STATUS_DELIVERED:
                return this.isStatus(['Dispatched']) && this.canIEdit();

            case OrderHelper.PERMISSION_STATUS_CANCELLED:
                return !this.isStatus(['Cancelled', 'Delivered']) && this.amIAdmin();

            case OrderHelper.PERMISSION_PAYMENT_PAY:
                return this.order.amountBalance > 0 &&
                    ((this.canIEdit() && this.isStatus(['Delivered', 'Dispatched'])) || this.amIAdmin());

            case OrderHelper.PERMISSION_PAYMENT_REFUND:
                return this.order.amountBalance < 0 &&
                    ((this.canIEdit() && this.isStatus(['Delivered', 'Dispatched', 'Cancelled'])) || this.amIAdmin());

            case OrderHelper.PERMISSION_ITEM_PROCESS:
            case OrderHelper.PERMISSION_ITEM_CANCEL:
            case OrderHelper.PERMISSION_ITEM_UPDATE_STATUS:
                return this.isStatus(['Processing']) && this.canIEdit();

            default:
                return false;
        }
    }
}

module.exports = OrderHelper


