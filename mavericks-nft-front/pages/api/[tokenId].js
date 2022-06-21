// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function handler(req, res) {
  
  const tokenId = req.query.tokenId

  const image_url = "https://raw.githubusercontent.com/oluwakore/Mavericks-NFT-Collection/main/mavericks-nft-front/public/nft-collection/"

  res.status(200).json({
    name: "Mavericks #" + tokenId,
    description: "Mavericks Chain is a collection for members of the Mavericks Chain DeFi",
    image: image_url + tokenId + ".svg"
  })
}
