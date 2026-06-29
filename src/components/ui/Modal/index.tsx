import CustomizedModal from "./modalComponent";
import { successModal, confirmModal } from "./modalInstance";
import { ModalType } from "./type";

const Modal: ModalType = CustomizedModal as ModalType;

Modal.confirm = confirmModal;
Modal.success = successModal;

export default Modal;
