using NetArchTest.Rules;
using Shop.BusinessLogic;
using Xunit;

namespace Shop.Tests;

public sealed class ArchitectureTests
{
    [Fact]
    public void BusinessLogic_Should_Not_Depend_On_Api()
    {
        var assembly = typeof(OrderService).Assembly;
        var rule = Types.InAssembly(assembly)
            .That().ResideInNamespace("Shop.BusinessLogic");
        Assert.NotEmpty(rule.GetTypes());

        var result = rule.ShouldNot()
            .HaveDependencyOn("Shop.Api").GetResult();
        Assert.True(result.IsSuccessful,
            $"BusinessLogic must not depend on Api. Failing: {string.Join(", ", result.FailingTypeNames ?? [])}");
    }
}