from app.exceptions.project_exception import DomainException

class TaskNotFoundError(DomainException):
    pass


class InvalidTaskUpdateError(DomainException):
    pass