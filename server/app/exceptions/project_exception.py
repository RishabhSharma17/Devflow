class DomainException(Exception):
    """Base class for domain errors."""
    def __init__(self, message: str = "Domain error"):
        self.message = message
        super().__init__(message)

class ProjectNotFoundError(DomainException):
    pass


class UserNotFoundError(DomainException):
    pass


class NotProjectMemberError(DomainException):
    pass


class PermissionDeniedError(DomainException):
    pass


class UserAlreadyMemberError(DomainException):
    pass


class CannotRemoveOwnerError(DomainException):
    pass


class CannotRemoveLastAdminError(DomainException):
    pass


class MemberRemovalFailedError(DomainException):
    pass