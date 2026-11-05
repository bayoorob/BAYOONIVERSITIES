namespace Shop.Model
{
    public sealed record Order(Guid Id);
}

namespace Shop.BusinessLogic
{
    public sealed class OrderService
    {
        public Shop.Model.Order Create() => new(Guid.NewGuid());

#if ARCHITECTURE_VIOLATION
        public Shop.Api.ApiDiagnostics? Diagnostics { get; set; }
#endif
    }
}

namespace Shop.Api
{
    public sealed class ApiDiagnostics;

    public sealed class OrderApi(Shop.BusinessLogic.OrderService service)
    {
        public Shop.Model.Order Get() => service.Create();
    }
}