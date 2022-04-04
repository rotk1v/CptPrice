const searchPrisjaktForItem = async (query) => {
  // let response = await fetch(
  //   `https://www.prisjakt.no/_internal/graphql?release=2022-04-01T10%3A32%3A35Z|92e09b94&version=3166a6&main=search&variables={%22id%22%3A%22search%22%2C%22query%22%3A%22${query}%22%2C%22sort%22%3A%22score%22%2C%22order%22%3A%22desc%22%2C%22offset%22%3A0%2C%22limit%22%3A48%2C%22filters%22%3A[{%22id%22%3A%22category_id%22%2C%22selected%22%3A[]}%2C{%22id%22%3A%22brand_id%22%2C%22selected%22%3A[]}%2C{%22id%22%3A%22lowest_price%22}%2C{%22id%22%3A%22user_rating%22}]%2C%22productModes%22%3A[%22product%22%2C%22raw%22]%2C%22categoryFilters%22%3A[]%2C%22brandFilters%22%3A[]%2C%22campaignId%22%3A4%2C%22personalizationClientId%22%3A%22%22%2C%22pulseEnvironmentId%22%3A%22sdrn%3Aschibsted%3Aenvironment%3Aundefined%22}`
  // );

  let response = await fetch(
    `https://www.prisjakt.no/_internal/graphql?version=81ff3a&main=search&variables={"id":"search","query":"${query}","sort":"score","order":"desc","offset":0,"limit":48,"filters":[{"id":"category_id","selected":[]},{"id":"brand_id","selected":[]},{"id":"lowest_price"},{"id":"user_rating"}],"productModes":["product","raw"],"categoryFilters":[],"brandFilters":[],"campaignId":4,"personalizationClientId":"768729747.1649063336","pulseEnvironmentId":"sdrn:schibsted:environment:8514a34c-a84d-4fde-a0be-8bcdb5df79e3"}`
  );

  if (response) {
    return response;
  }
};

const getStoresBasedOnItemId = async (id) => {
  console.log(id);
  let response = await fetch(
    `https://www.prisjakt.no/_internal/graphql?version=81ff3a&main=product&variables={"id":${id},"offset":0,"section":"main","marketCode":"no","personalizationExcludeCategories":[],"recommendationsContextId":"product-page","includeSecondary":false,"excludeTypes":["not_available_for_purchase","pickup_only","used_product","not_in_mint_condition"],"variants":null,"advized":false,"condition":"new","campaigns":null,"variant":{"id":0},"priceDisplay":"price-excludes-shipping","sorting":"price","filter":null,"options":{"showPricesInclShipping":false,"showInternational":false,"showUnavailable":false,"showPickupOnly":false,"showUsedProducts":false,"showNotInMintCondition":false},"filters":[],"priceList":true,"includeShipping":false,"userActions":true,"badges":true,"media":true,"campaign":true,"relatedProducts":true,"campaignDeals":true,"priceHistory":true,"campaignId":4,"personalizationClientId":"","pulseEnvironmentId":""}`
  );

  if (response) {
    return response;
  }
};

// let products = document.querySelectorAll(".product-list");
let products = document.querySelectorAll(".product-list-item");

let productTitles = [];

products.forEach(async (item, key, parent) => {
  const embed = document.createElement("div");
  embed.className = "price-wrapper";

  // if (key < 20) {
  productTitles.push(item.innerText.split("\n")[0]);

  let priceDiv = item.getElementsByClassName("price-wrapper")[0];

  let searchParam = item.innerText.split("\n")[0];
  let query = await searchPrisjaktForItem(searchParam);
  let response = await query.json();
  // console.log(response.data);
  if (
    response &&
    response.data.search.resources.products.nodes[0] &&
    response.data.search.resources.products.nodes[0].pathName
  ) {
    let pathName =
      response.data.search.resources.products.nodes[0].pathName.split("=")[1];

    let request = await getStoresBasedOnItemId(pathName);
    let response2 = await request.json();
    let storeNodes = response2.data.product.prices.nodes;
    let storesWithItem = storeNodes.map((obj, key) => {
      return {
        storeName: obj.store.name,
        priceExclShipping: obj.price.exclShipping,
        priceInclShipping: obj.price.inclShipping,
        inStock: obj.stock.status === "in_stock" ? true : false,
        extUri: obj.externalUri,
      };
    });

    let htmlChildren = [];
    storesWithItem.filter((item, index) => {
      if (item.inStock) {
        if (item.priceExclShipping) {
          if (item.storeName === "Komplett") {
            htmlChildren.push(
              `<a href=${item.extUri} style="width:100em;display:flex;flex-direction:row;justify-content:space-between;color:#e8a20d;"><p>${item.storeName}</p><p>${item.priceExclShipping}</p></a>`
            );
          } else if (item.extUri == null) {
            htmlChildren.push(
              `<a style="width:100em;display:flex;flex-direction:row;justify-content:space-between;"><p>${item.storeName}</p><p>${item.priceExclShipping}</p></a>`
            );
          } else {
            htmlChildren.push(
              `<a href=${item.extUri} target="_blank" style="width:100em;display:flex;flex-direction:row;justify-content:space-between;"><p>${item.storeName}</p><p>${item.priceExclShipping}</p></a>`
            );
          }
        } else {
          console.log("not in stock");
        }
      }
    });

    embed.innerHTML = `<div style='width:25rem;display:flex;flex-wrap:wrap;border:1px outset #e8a20d;padding:1rem;flex-grow:1;background-color:#f5f5f5;'>${htmlChildren
      .toLocaleString()
      .replace(/,/g, "")}</div>`;

    parent[key]
      .querySelector(".content-block")
      .removeChild(item.getElementsByClassName("box-bottom")[0]);
    parent[key].querySelector(".content-block").replaceChild(embed, priceDiv);
    // }
  } else {
    console.log("no match");
  }
});
